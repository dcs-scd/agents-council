// Structured claim/response schemas for the Claim-Ledger Delphi council path.
//
// WU-B1 (taxonomy: contract). This module defines the Zod contract for the
// structured deliberation payloads and a *fallback* helper that validates a
// candidate structured payload and, on any validation failure, defers to the
// existing legacy text parser in modelCouncil.ts.
//
// INV-2: every structured code path is reachable ONLY under the env flag
// `AGENTS_COUNCIL_STRUCTURED`. This module must therefore be loaded ONLY via a
// guarded dynamic `import()` from inside a flag-checked branch — the legacy
// (flag-off) path must never import or evaluate it, so unsetting the flag
// restores byte-for-byte legacy behavior. Do not add a top-level import of this
// file anywhere on the legacy path.

import { z } from "zod";

// Top-level load marker. Set exactly once when this module is first evaluated.
// Used by the flag-off isolation test (gate_schema_fallback evidence (c)) to
// prove the legacy path never imports/evaluates this module: if the flag is off
// and nothing dynamically imported us, this global stays undefined.
(globalThis as { __AGENTS_COUNCIL_SCHEMAS_LOADED__?: boolean }).__AGENTS_COUNCIL_SCHEMAS_LOADED__ = true;

// --- Core claim contract ----------------------------------------------------

// Provenance of a claim. `repo_fact` claims cite an evidence-pack ID (the
// Level-1 source-ID check in WU-B2 consumes this); `source_claim` derives from
// another stated claim; `assumption` is unverified and must state its cheapest
// verification downstream (WU-B2). The enum is frozen here as the contract.
export const ProvenanceSchema = z.enum(["repo_fact", "source_claim", "assumption"]);
export type Provenance = z.infer<typeof ProvenanceSchema>;

export const ClaimSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  provenance: ProvenanceSchema,
  // Defaults to [] when omitted. The prompt describes this field as the ids "a repo_fact
  // cites", so a model that omits it on an `assumption` or `source_claim` is reading the
  // contract correctly — but a bare z.array() made the key mandatory and rejected the WHOLE
  // payload. Live, that was the entire structured parse-failure rate: Opus omits the key on
  // assumptions, ChatGPT emits `[]`, so the parse rate depended on which model you seated.
  // A missing `evidence` on a repo_fact still trips SOURCE_ID_MISMATCH — [] cites nothing.
  evidence: z.array(z.string()).default([]),
  // How an `assumption` would be cheapest verified. The WU-B2 precondition demands
  // this of every assumption, but the field was absent from the schema — and zod
  // strips unknown keys, so a member that volunteered it had it deleted before the
  // check ran. Every assumption therefore tripped ASSUMPTION_NO_VERIFICATION
  // unconditionally. Declaring the field is what makes that precondition satisfiable.
  cheapestVerification: z.string().optional(),
  // Optional free-form severity label (e.g. "high"/"low"); WU-B2 interprets it.
  severity: z.string().optional(),
});
export type Claim = z.infer<typeof ClaimSchema>;

// --- Deliberation payloads --------------------------------------------------

// A member's independent first-round proposal: a candidate answer plus the
// claims that back it.
export const IndependentProposalSchema = z.object({
  candidateConsensus: z.string(),
  claims: z.array(ClaimSchema),
});
export type IndependentProposal = z.infer<typeof IndependentProposalSchema>;

// A member's deliberation-round response: its (possibly revised) candidate, its
// claims, and its self-reported convergence signal (mirrors the legacy
// CONSENSUS_STATUS / MATERIAL_DISAGREEMENTS markers).
export const DeliberationResponseSchema = z.object({
  candidateConsensus: z.string(),
  claims: z.array(ClaimSchema),
  consensusStatus: z.enum(["converged", "diverged", "unknown"]).optional(),
  materialDisagreements: z.array(z.string()).optional(),
});
export type DeliberationResponse = z.infer<typeof DeliberationResponseSchema>;

// A member's ratification vote. Decision + optional block kind / required edits
// mirror the legacy RatificationVote shape so the structured path can hydrate
// the same downstream contract.
export const RatificationVoteSchema = z.object({
  decision: z.enum(["accept", "accept_with_edits", "block"]),
  blockKind: z
    .enum(["MATERIAL_DISAGREEMENT", "INSUFFICIENT_EVIDENCE", "SYNTHESIS_ERROR", "FACTUAL_ERROR", "PROTOCOL"])
    .optional(),
  requiredEdits: z.string().optional(),
});
export type RatificationVote = z.infer<typeof RatificationVoteSchema>;

// --- Per-run parse-fail telemetry ------------------------------------------

// Counts attempted structured parses and how many fell back to text. Exposed so
// a run can log the parse-fail rate (Wave-C entry-gate evidence: rate < 5%).
let attempted = 0;
let failed = 0;

export function recordParseAttempt(success: boolean): void {
  attempted += 1;
  if (!success) {
    failed += 1;
  }
}

export function getParseFailStats(): { attempted: number; failed: number; rate: number } {
  return { attempted, failed, rate: attempted === 0 ? 0 : failed / attempted };
}

// Reset between runs (and in tests). Not on the legacy path.
export function resetParseFailStats(): void {
  attempted = 0;
  failed = 0;
}

// --- Fallback helper --------------------------------------------------------

// Validate a candidate structured payload against `schema`. On success, record
// a successful attempt and return the typed object. On ANY validation failure
// (including non-JSON input), record a failed attempt and return the result of
// the supplied legacy text parser applied to `content` — never throw. This is
// the single fallback seam wired into the legacy parsers under the flag.
export function parseStructuredOrFallback<TStructured, TFallback>(
  content: string,
  schema: z.ZodType<TStructured>,
  fallback: (content: string) => TFallback,
): TStructured | TFallback {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    recordParseAttempt(false);
    return fallback(content);
  }
  const result = schema.safeParse(parsed);
  if (result.success) {
    recordParseAttempt(true);
    return result.data;
  }
  recordParseAttempt(false);
  return fallback(content);
}

// --- Self-test (gate_zod_bundled) ------------------------------------------

// A dependency-free smoke that exercises a real Zod schema parse. Reachable
// from the compiled binary via `council --selftest` so we can prove Zod is
// bundled into dist/council even though `zod` lives in devDependencies. Returns
// a one-line PASS/FAIL summary; never throws.
export function schemaSelfTest(): string {
  const valid: Claim = {
    id: "c1",
    text: "the build script compiles the CLI",
    provenance: "repo_fact",
    evidence: ["package.json:build"],
  };
  const ok = ClaimSchema.safeParse(valid).success;
  const bad = ClaimSchema.safeParse({ id: "", text: "", provenance: "bogus", evidence: "no" }).success;
  return ok && !bad ? "SELFTEST PASS: zod ClaimSchema parsed valid + rejected invalid" : "SELFTEST FAIL";
}

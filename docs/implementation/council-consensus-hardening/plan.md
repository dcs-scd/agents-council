# Council Consensus Hardening Plan (F1+F2+F3+F7)

## Objective

Make the two-member model council (`src/core/services/modelCouncil.ts`) actually
reach and record consensus when its members substantively agree. The dogfood run
on 2026-06-02 (`deliberations/council-2026-06-02T19-44-29-497Z.md`) proved the
pathology live: both members produced near-identical F1–F7 evaluations, yet the
run ended `not_attempted` after all 6 rounds — ratification never even ran —
because the Jaccard convergence gate never fired (memberAgreement peaked 0.339 vs
the 0.80 threshold; similarityToPrevious peaked 0.937 vs 0.95). The consensus
mechanism is gated behind a token-overlap proxy that systematically fails for the
council's own medium (prose).

This plan hardens four behaviors, in dependency order F1 → F2 → F3 → F7. All four
are contained to `modelCouncil.ts` + `modelCouncil.test.ts` (verified: neither
`cli/index.ts` nor `interfaces/mcp/server.ts` reads `.accepted`/`.outcome`; both
consume only `runModelCouncil`, `formatModelCouncilMarkdown`, and
`consensus.{reached,ratifiedBy,blockedBy}`).

Phase (b) of this effort already shipped two foundational bugfixes (verified,
green) that WU-1 builds on: `parseRatificationAccepted` was hardened to tolerate
decorated/preamble markers and exported; `formatModelCouncilMarkdown`'s title now
keys on `consensus.outcome` (so `not_attempted` no longer renders as "Blocked").

## Context: current flow (verified line refs)

- `runModelCouncil` (L236): propose → loop ≤`maxRounds` deliberation rounds →
  build shared candidate → `isConverged` early-break → ratify ONLY if `converged`
  → one bounded repair cycle.
- `isConverged` (L1188): three arms — `!changed` (byte-identical), Jaccard
  `similarityToPrevious ≥ 0.95`, `memberAgreement ≥ 0.80`. **This gate decides
  whether ratify runs at all.** That is the root defect (F2).
- `ratifyCandidate` (L337) → `parseRatificationAccepted` (L1124) → `accepted: boolean` (type L93).
- `shouldAttemptRepair` (L359), `buildSynthesisMessages` (L1084): the existing
  repair cycle is a partial, implicit F1 — it treats "ACCEPT after edits" blocks
  as repairable, but only after a full BLOCK was already recorded.
- `buildConsensusResult` (L1273): `!converged → not_attempted`; else
  `reached = all accepted ? ratified : blocked`.

## Invariants (must hold across all WUs)

- **Do not change any LLM model parameter** — model IDs, temperature, token/context
  limits, reasoning effort, sampling. (Root Hard Rule 1.)
- **Preserve the public result contract.** `consensus.reached`,
  `consensus.ratifiedBy`, `consensus.blockedBy`, `consensus.outcome`, and
  `ratifications[].{content,member}` must keep their current meaning and types so
  `cli/index.ts` and `interfaces/mcp/server.ts` (esp. `formatModelCouncil` L597)
  need no edits. New fields are additive only.
- **Members remain text-only.** `askClaude` is `canUseTool: deny`; `askCodex` is
  `sandboxMode: "read-only"`, network off. F7 injects snippets into the prompt; it
  does NOT grant tool/disk access.
- **Convergence behavior is a strict superset.** No change may make a run that
  currently reaches `ratified` stop doing so.
- Required checks pass after every WU: `bun run typecheck`, `bun run format:check`,
  `bun test src/core/services/modelCouncil.test.ts`.

## Work Units (sequential — all edit `modelCouncil.ts`, cannot parallelize)

### WU-1 — F1: ternary ratification vote + tolerant symmetric parser

Replace the boolean ratification verdict with a structured ternary vote.

- New type `RatificationVote = { decision: "accept" | "accept_with_edits" | "block";
  blockKind?: "MATERIAL_DISAGREEMENT" | "INSUFFICIENT_EVIDENCE" | "SYNTHESIS_ERROR"
  | "FACTUAL_ERROR" | "PROTOCOL"; requiredEdits?: string; raw: string }`.
- `parseRatificationAccepted` → `parseRatificationVote(content): RatificationVote`.
  Generalize the existing tolerant marker scan (glyph-strip + preamble, L1131–1134)
  symmetrically across all three markers: `CONSENSUS: ACCEPT`,
  `CONSENSUS: ACCEPT_WITH_EDITS` (capture following `REQUIRED_EDITS:` block),
  `CONSENSUS: BLOCK` (capture following `BLOCK_KIND:`). Markerless → re-ask once;
  still markerless → `decision:"block", blockKind:"PROTOCOL"` (a protocol error, NOT
  a silent substantive veto).
- On `ModelCouncilRatification` (L92): ADD `vote: RatificationVote`. KEEP
  `accepted: boolean` as a derived value (`vote.decision === "accept"`) so no
  downstream consumer breaks (minimal blast radius).
- `buildRatificationMessages` (L1039): update the system prompt to instruct the
  ternary marker grammar and `BLOCK_KIND`/`REQUIRED_EDITS` format.
- `shouldAttemptRepair` (L359): true when any vote is `accept_with_edits`, or a
  `block` with a repairable kind (NOT `FACTUAL_ERROR`/`MATERIAL_DISAGREEMENT`).
- `buildSynthesisMessages` (L1084): feed `requiredEdits` (not just raw content) of
  `accept_with_edits` voters into the synthesis prompt.
- `buildConsensusResult` (L1273): `reached` iff every vote ∈ {accept,
  resolved accept_with_edits}. Add no new outcome value unless `PROTOCOL` forces it
  (prefer reusing `blocked` with a reason string to honor the result contract).
- **Verify:** unit tests — each marker shape parses to the right decision/kind;
  decorated + preamble variants (carried from phase (b)); markerless → PROTOCOL;
  `accepted` derived field still matches `decision==="accept"`.

### WU-2 — F2: decouple ratification from the Jaccard gate (the keystone)

Ratification must run on the council's actual agreement, not a token-overlap proxy.

- In `runModelCouncil` (L236): after each round's candidate is built (index ≥ 2,
  candidate non-empty), if the agreement signal says "worth asking" run
  `ratifyCandidate`; unanimous accept → finalize and break. **Always** ratify the
  final round's candidate before returning, even when no `isConverged` arm fired —
  so a run can no longer end `not_attempted` purely because Jaccard stayed low.
- Demote the Jaccard arms of `isConverged` to an *early-stop hint*, not a
  *precondition for ratifying*. Keep them as a superset (byte-identical or high-sim
  still short-circuits), but their absence no longer suppresses ratification.
- Keep round-level Jaccard metrics in `ModelCouncilRound` for the rendered
  Convergence table (telemetry), unchanged.
- **Cost note:** bounds extra LLM calls. Minimal correct form = "always ratify the
  final candidate" (1 extra ratify round) + "early-ratify when the agreement signal
  fires." Do NOT ratify every round unconditionally at N=2 (10 extra calls).
- **Verify:** a synthetic run where members agree in substance but Jaccard stays
  < 0.80/0.95 now produces a ratify round and a `ratified`/`blocked` outcome — never
  `not_attempted`. A genuinely non-convergent run still ratifies the final candidate
  (and may legitimately `block`). Existing `ratified` cases stay `ratified`.

### WU-3 — F3: structured consensus signal (replace the proxy)

Let members self-report agreement instead of inferring it from token overlap.

- Extend the deliberation prompt (`buildDeliberationMessages`, system text near
  L1020–1027) to require two markers after `CANDIDATE_CONSENSUS:`:
  `CONSENSUS_STATUS: CONVERGED|DIVERGED` and
  `MATERIAL_DISAGREEMENTS: <one-line list | NONE>`.
- Add `parseConsensusSignal(content)`; use the parsed status as the primary
  agreement signal feeding WU-2's "worth asking"/early-stop decision (a member
  declaring "no material disagreements" is a far better convergence signal than
  Jaccard). Demote `averagePairwiseSimilarity`/`memberAgreement` to telemetry.
- Fallback when markers absent (older transcript / model omission): overlap
  coefficient on candidate drafts rather than Jaccard (less length-biased).
- **No new LLM calls** — members already emit the candidate text; this rides along.
- **Verify:** a round where both members emit `CONSENSUS_STATUS: CONVERGED` /
  `MATERIAL_DISAGREEMENTS: NONE` triggers ratification regardless of Jaccard;
  marker-absent rounds fall back to overlap-coef and still behave.

### WU-4 — F7: snippet-grounded ratification + FACTUAL_ERROR veto (depends on WU-1)

Close the false-accept axis: today no mechanism catches a confidently-wrong claim
that both members happen to agree on, and the read-capable member is never asked to
verify.

- `buildRatificationMessages` (L1039): inject the cited source snippets the
  candidate relies on into the ratify user message (the `council-solve` runner
  already inlines file contents into the original prompt; thread those through so
  ratifiers can check claims against actual text without tool access).
- `FACTUAL_ERROR` block kind (from WU-1) = **absolute veto**: it cannot be cleared
  by the repair/synthesis cycle and overrides any `accept_with_edits`. Wire this
  into `shouldAttemptRepair` and `buildConsensusResult`.
- **FYI / out of scope:** the deeper inversion (the disk/tool-capable Codex member
  is never asked to verify, while the tool-denied Claude chair authors) is recorded
  as a future item; this WU does NOT re-architect the transports.
- **Verify:** a candidate asserting a claim contradicted by an injected snippet,
  with a member voting `BLOCK_KIND: FACTUAL_ERROR`, yields `blocked` and is NOT
  repaired into `ratified`.

## Acceptance Gates

- **Gate-1 (F1):** ternary parser + vote type land; all marker shapes covered by
  tests; `accepted` back-compat preserved; typecheck + format clean.
- **Gate-2 (F2):** no run can end `not_attempted` when a non-empty final candidate
  exists; substantive-agreement-low-Jaccard regression test passes; no prior
  `ratified` case regresses.
- **Gate-3 (F3):** structured signal drives convergence; Jaccard demoted to
  telemetry; overlap-coef fallback tested.
- **Gate-4 (F7):** FACTUAL_ERROR is an unrepairable veto; snippet injection present
  in the ratify message; false-accept regression test passes.
- **Gate-5 (contract):** `cli/index.ts` and `interfaces/mcp/server.ts` unchanged and
  still compile/run; `consensus.{reached,ratifiedBy,blockedBy,outcome}` semantics
  intact.
- **Gate-6 (suite):** full `bun test` green; `bun run typecheck`, `bun run format:check` clean.

## Pipeline Handoff

- Work units: `work-units.md`
- Status ledger: `status-ledger.md`
- Validation: `bun run typecheck`, `bun run format:check`, `bun test src/core/services/modelCouncil.test.ts`
- Human-facing rollup: `../../implementation-notes.html`

import { afterEach, describe, expect, test } from "bun:test";

import {
  evaluateRatificationPreconditions,
  runModelCouncil,
  shouldAttemptRepair,
  type EvidencePackEntry,
  type ModelCouncilCandidateProposal,
  type ModelCouncilRatification,
} from "./modelCouncil";

// M1 (post-hydra hardening) — a WU-B2 claim-ledger precondition block must reach
// `consensus.minorityReport` AND survive the WU-B4 repair cycle.
//
// The pre-existing modelCouncil.minorityReport.test.ts proves a *hand-built*
// FACTUAL_ERROR veto reaches the report, but it never routes through the real
// evaluateRatificationPreconditions path and never touches shouldAttemptRepair.
// This file closes both gaps:
//   (1) end-to-end: a structured proposal citing an unverifiable repo_fact, run
//       through the REAL runModelCouncil under the flag (mock OpenRouter transport),
//       lands a SOURCE_ID_MISMATCH FACTUAL_ERROR dissent in consensus.minorityReport
//       and records NO repair — the absolute veto gated the repair cycle off, so the
//       block cannot be re-ratified away (a re-ratify replaces ratifications wholesale).
//   (2) the gate itself: shouldAttemptRepair is false for a REAL precondition block,
//       and — contrast — true for a non-absolute block of the same slate shape, so
//       (1)'s no-repair result is provably the veto's doing, not the slate shape.

const FLAG = "AGENTS_COUNCIL_STRUCTURED";

// Env this file mutates for the end-to-end run; snapshot + restore so nothing leaks
// into sibling test files that share the process.
const TOUCHED_ENV = [
  FLAG,
  "AGENTS_COUNCIL_MEMBERS",
  "OPENROUTER_API_KEY",
  "AGENTS_COUNCIL_OPENROUTER_URL",
  "AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS",
  "AGENTS_COUNCIL_MAX_ROUNDS",
] as const;
const priorEnv = new Map(TOUCHED_ENV.map((key) => [key, process.env[key]]));
afterEach(() => {
  for (const [key, value] of priorEnv) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

const pack: EvidencePackEntry[] = [{ id: "EV-1", text: "The repo uses Bun.", source: "package.json" }];

function proposal(content: unknown): ModelCouncilCandidateProposal {
  const raw = typeof content === "string" ? content : JSON.stringify(content);
  return { member: { name: "Opus 4.8", model: "claude-test" }, content: raw, candidateConsensus: "use Bun" };
}

// A lone repo_fact citing a pack id that does not exist → the Level-1 source-ID
// check fires SOURCE_ID_MISMATCH → an absolute FACTUAL_ERROR precondition block.
const PLANTED = {
  candidateConsensus: "use Bun",
  claims: [{ id: "c1", text: "the build script is `bun run x`", provenance: "repo_fact", evidence: ["EV-404"] }],
};

// A peer member that ratifies the candidate — what an LLM emits on the happy path.
// Stands in for the peer vote in the fast gate tests so the slate is mixed.
const peerAccept: ModelCouncilRatification = {
  member: { name: "ChatGPT 5.5", model: "codex-test" },
  content: "CONSENSUS: ACCEPT — ship it",
  accepted: true,
  vote: { decision: "accept", raw: "CONSENSUS: ACCEPT — ship it" },
};

// Minimal mock OpenRouter transport: reply with the next canned body per call,
// falling back to the last (mirrors the harness in modelCouncil.minorityReport.test.ts).
function mockOpenRouter(canned: string[]): { url: string; stop: () => void } {
  let index = 0;
  const server = Bun.serve({
    port: 0,
    fetch: () => {
      const content = canned[index] ?? canned[canned.length - 1];
      index += 1;
      return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
        headers: { "Content-Type": "application/json" },
      });
    },
  });
  return { url: server.url.toString(), stop: () => server.stop(true) };
}

describe("M1 claim-ledger precondition reaches minorityReport + survives repair", () => {
  test("(end-to-end) a structured unverifiable repo_fact blocks the run; its dissent reaches minorityReport, with no repair", async () => {
    const server = mockOpenRouter([
      "Initial independent answer.",
      // deliberation (round 1): structured payload whose repo_fact cites EV-404,
      // absent from the (empty) evidence pack -> SOURCE_ID_MISMATCH precondition.
      JSON.stringify(PLANTED),
      // ratification: the member accepts; the prepended precondition veto still blocks.
      "CONSENSUS: ACCEPT\nMatches the source.",
    ]);
    process.env[FLAG] = "1";
    process.env.AGENTS_COUNCIL_MEMBERS = "kimi";
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENTS_COUNCIL_OPENROUTER_URL = server.url;
    process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS = "5000";
    process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";
    try {
      const result = await runModelCouncil({ prompt: "What is the build script?" });

      expect(result.consensus.outcome).toBe("blocked");
      expect(result.consensus.minorityReport).toBeDefined();
      const ledgerDissent = result.consensus.minorityReport!.find((entry) =>
        entry.dissent.includes("SOURCE_ID_MISMATCH"),
      );
      expect(ledgerDissent).toBeDefined();
      expect(ledgerDissent!.blockKind).toBe("FACTUAL_ERROR");
      expect(ledgerDissent!.absolute).toBe(true);
      // The precondition block is still in the decisive ratifications (not re-ratified
      // away) BECAUSE the absolute veto gated the repair cycle off entirely.
      expect(result.ratifications.some((ratification) => ratification.content.includes("SOURCE_ID_MISMATCH"))).toBe(
        true,
      );
      expect(result.repair).toBeUndefined();
    } finally {
      server.stop();
    }
  }, 30000);

  test("(gate) shouldAttemptRepair is false for a REAL precondition block", async () => {
    process.env[FLAG] = "1";
    const blocks = await evaluateRatificationPreconditions([proposal(PLANTED)], pack);
    expect(blocks).toHaveLength(1);
    // The absolute FACTUAL_ERROR veto turns repair off, so a re-ratify can never run
    // and discard it.
    expect(shouldAttemptRepair([...blocks, peerAccept])).toBe(false);
  });

  test("(contrast) shouldAttemptRepair is true for a non-absolute block of the same slate shape", () => {
    const repairable: ModelCouncilRatification = {
      member: { name: "Opus 4.8", model: "claude-test" },
      content: "BLOCK: INSUFFICIENT_EVIDENCE — cite the build script",
      accepted: false,
      vote: { decision: "block", blockKind: "INSUFFICIENT_EVIDENCE", raw: "BLOCK: INSUFFICIENT_EVIDENCE" },
    };
    // Same shape (one block + one accept), but no absolute veto -> repairable. Proves
    // the prior test's `false` is the veto's doing, not a constant of the slate.
    expect(shouldAttemptRepair([repairable, peerAccept])).toBe(true);
  });
});

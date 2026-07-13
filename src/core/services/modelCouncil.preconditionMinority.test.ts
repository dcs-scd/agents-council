import { afterEach, describe, expect, test } from "bun:test";

import {
  councilOutcomeExitCode,
  evaluateRatificationPreconditions,
  runModelCouncil,
  shouldAttemptRepair,
  type EvidencePackEntry,
  type ModelCouncilCandidateProposal,
  type ModelCouncilRatification,
} from "./modelCouncil";

// M1 (revised 2026-07-13) — a WU-B2 claim-ledger precondition is a FINDING, not a vote.
//
// This file previously pinned the opposite contract: a fired precondition synthesized an
// absolute FACTUAL_ERROR ratification attributed to the member, which blocked the run and
// gated the repair cycle off. The first substantive live run under the flag showed why that
// is wrong — both members voted ACCEPT_WITH_EDITS, and the council still came back `blocked`
// with each member listed in BOTH `acceptedWithEditsBy` and `blockedBy`, no edit-fold, exit 1.
// The engine was forging votes nobody cast, and an evidence-hygiene lapse was being treated as
// an absolute veto (the kind reserved for a member asserting a factual error).
//
// The contract these tests now pin:
//   (1) end-to-end: a structured proposal citing an unverifiable repo_fact records a
//       SOURCE_ID_MISMATCH *finding*, and the members' own votes decide the outcome — an
//       ACCEPT slate ratifies, exit 0. The finding is reported, never tallied.
//   (2) the live regression: an ACCEPT_WITH_EDITS slate WITH a fired precondition reaches
//       `ratified_with_edits` with the edits folded, and the member never appears in
//       `blockedBy`. This is the exact case that failed in production.
//   (3) the gate: preconditions never reach shouldAttemptRepair, and a real non-absolute
//       member block of the same slate shape is still repairable — proving (1)/(2) come from
//       the findings being out of the tally, not from repair being broken.
// A member's OWN absolute veto is untouched (INV-4): modelCouncil.minorityReport.test.ts still
// pins a hand-cast FACTUAL_ERROR block -> blocked + minorityReport.

const FLAG = "AGENTS_COUNCIL_STRUCTURED";

// Env this file mutates for the end-to-end run; snapshot + restore so nothing leaks
// into sibling test files that share the process.
const TOUCHED_ENV = [
  FLAG,
  "AGENTS_COUNCIL_MEMBERS",
  // A2: the end-to-end cases use a single-member roster, so they opt into the solo quorum.
  "AGENTS_COUNCIL_ALLOW_SOLO",
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
// check fires SOURCE_ID_MISMATCH → a claim-ledger finding (no vote).
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

function structuredSoloEnv(serverUrl: string): void {
  process.env[FLAG] = "1";
  process.env.AGENTS_COUNCIL_MEMBERS = "kimi";
  process.env.AGENTS_COUNCIL_ALLOW_SOLO = "1";
  process.env.OPENROUTER_API_KEY = "test-key";
  process.env.AGENTS_COUNCIL_OPENROUTER_URL = serverUrl;
  process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS = "5000";
  process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";
}

describe("M1 claim-ledger precondition is a finding, not a vote", () => {
  test("(end-to-end) an unverifiable repo_fact is reported as a finding; the member's ACCEPT still ratifies", async () => {
    const server = mockOpenRouter([
      "Initial independent answer.",
      // deliberation (round 1): structured payload whose repo_fact cites EV-404,
      // absent from the (empty) evidence pack -> SOURCE_ID_MISMATCH precondition.
      JSON.stringify(PLANTED),
      // ratification: the member accepts. Under the old contract the synthesized veto
      // overrode this and blocked the run; now the member's own vote decides.
      "CONSENSUS: ACCEPT\nMatches the source.",
    ]);
    structuredSoloEnv(server.url);
    try {
      const result = await runModelCouncil({ prompt: "What is the build script?" });

      // The member accepted, so the council ratifies — the hygiene finding does not vote.
      expect(result.consensus.outcome).toBe("ratified");
      expect(councilOutcomeExitCode(result.consensus.outcome)).toBe(0);
      expect(result.consensus.blockedBy).toEqual([]);
      // ...and the finding is still surfaced, not swallowed.
      expect(result.preconditionFindings).toBeDefined();
      expect(result.preconditionFindings![0]!.kinds).toContain("SOURCE_ID_MISMATCH");
      expect(result.preconditionFindings![0]!.detail).toContain("SOURCE_ID_MISMATCH");
      // No synthesized ratification anywhere in the decisive tally.
      expect(result.ratifications.some((r) => r.content.includes("SOURCE_ID_MISMATCH"))).toBe(false);
      expect(result.consensus.minorityReport).toBeUndefined();
    } finally {
      server.stop();
    }
  }, 30000);

  test("(regression, live 2026-07-13) an ACCEPT_WITH_EDITS slate with a fired precondition folds and ratifies", async () => {
    const server = mockOpenRouter([
      "Initial independent answer.",
      JSON.stringify(PLANTED),
      "CONSENSUS: ACCEPT_WITH_EDITS\nREQUIRED_EDITS: cite the build script explicitly.",
      // the chair's fold of the required edits (A1) — reachable only because the
      // precondition no longer synthesizes an absolute veto that gates repair/fold off.
      "use Bun; the build script is `bun run build`.",
    ]);
    structuredSoloEnv(server.url);
    try {
      const result = await runModelCouncil({ prompt: "What is the build script?" });

      // The exact production failure: this came back `blocked`, exit 1, with the member
      // in BOTH lists and no fold.
      expect(result.consensus.outcome).toBe("ratified_with_edits");
      expect(councilOutcomeExitCode(result.consensus.outcome)).toBe(0);
      expect(result.consensus.blockedBy).toEqual([]);
      expect(result.consensus.acceptedWithEditsBy).toBeDefined();
      expect(result.consensus.acceptedWithEditsBy!.length).toBeGreaterThan(0);
      // No member may appear as both an edit-accepter and a blocker.
      for (const member of result.consensus.acceptedWithEditsBy!) {
        expect(result.consensus.blockedBy).not.toContain(member);
      }
      // The fold ran, and the finding rode along as a report.
      expect(result.fold).toBeDefined();
      expect(result.preconditionFindings![0]!.kinds).toContain("SOURCE_ID_MISMATCH");
    } finally {
      server.stop();
    }
  }, 30000);

  test("(gate) a fired precondition yields a finding that carries no vote and never reaches the tally", async () => {
    process.env[FLAG] = "1";
    const findings = await evaluateRatificationPreconditions([proposal(PLANTED)], pack);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.member).toBe("Opus 4.8");
    expect(findings[0]!.kinds).toEqual(["SOURCE_ID_MISMATCH"]);
    // A finding is structurally incapable of entering the vote tally: it has no `vote`.
    expect("vote" in findings[0]!).toBe(false);
    // The slate the tally actually sees is just the members' votes — still repairable.
    expect(shouldAttemptRepair([peerAccept])).toBe(false); // an all-accept slate needs no repair
  });

  test("(contrast) shouldAttemptRepair is true for a non-absolute block of the same slate shape", () => {
    const repairable: ModelCouncilRatification = {
      member: { name: "Opus 4.8", model: "claude-test" },
      content: "BLOCK: INSUFFICIENT_EVIDENCE — cite the build script",
      accepted: false,
      vote: { decision: "block", blockKind: "INSUFFICIENT_EVIDENCE", raw: "BLOCK: INSUFFICIENT_EVIDENCE" },
    };
    // A real member block still routes through repair — proving the tests above pass
    // because findings are out of the tally, not because repair stopped working.
    expect(shouldAttemptRepair([repairable, peerAccept])).toBe(true);
  });
});

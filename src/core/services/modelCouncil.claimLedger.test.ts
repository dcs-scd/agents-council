import { afterEach, describe, expect, test } from "bun:test";

import {
  evaluateClaimLedgerPreconditions,
  evaluateRatificationPreconditions,
  type EvidencePackEntry,
  type ModelCouncilCandidateProposal,
} from "./modelCouncil";

// WU-B2: claim-ledger ratification preconditions + the Level-1 source-ID check
// (Addendum A.3.3). Two layers are exercised through their REAL code paths:
//   (1) the pure, deterministic core `evaluateClaimLedgerPreconditions` (INV-9 —
//       no LLM, no sandbox, no network), covering all three checks; and
//   (2) the flag-gated applier `evaluateRatificationPreconditions` on the actual
//       parse -> eval -> block-synthesis path: a planted unverifiable `repo_fact`
//       is surfaced as a FACTUAL_ERROR block under AGENTS_COUNCIL_STRUCTURED, and
//       the path is a no-op (returns []) with the flag off (INV-2). The block
//       reuses the existing absolute FACTUAL_ERROR kind (INV-4) and enters only
//       the ratifications array, never the convergence controller (INV-3).
//
// Note on the strict schema: ClaimSchema (WU-B1) requires `provenance`, so a
// literally unlabeled claim makes the structured parse fail and falls back to the
// legacy path (no block) — the UNLABELED_CLAIM check is reachable only at the
// pure-core layer, asserted below. End-to-end coverage of "an unverifiable repo
// claim" therefore uses a `repo_fact` that cites an absent / empty evidence id,
// which IS the Level-1 source-ID deliverable.

const FLAG = "AGENTS_COUNCIL_STRUCTURED";
const priorFlag = process.env[FLAG];
afterEach(() => {
  if (priorFlag === undefined) {
    delete process.env[FLAG];
  } else {
    process.env[FLAG] = priorFlag;
  }
});

const pack: EvidencePackEntry[] = [{ id: "EV-1", text: "The repo uses Bun.", source: "package.json" }];
const packIds = new Set(pack.map((entry) => entry.id));

function proposal(content: unknown): ModelCouncilCandidateProposal {
  const raw = typeof content === "string" ? content : JSON.stringify(content);
  return { member: { name: "Opus 4.8", model: "claude-test" }, content: raw, candidateConsensus: "use Bun" };
}

describe("WU-B2 claim-ledger preconditions — pure core (INV-9)", () => {
  test("a repo_fact citing an id absent from the pack fires SOURCE_ID_MISMATCH", () => {
    const fired = evaluateClaimLedgerPreconditions([{ provenance: "repo_fact", evidence: ["EV-404"] }], packIds);
    expect(fired.map((f) => f.kind)).toEqual(["SOURCE_ID_MISMATCH"]);
  });

  test("a repo_fact citing a present id does not fire", () => {
    const fired = evaluateClaimLedgerPreconditions([{ provenance: "repo_fact", evidence: ["EV-1"] }], packIds);
    expect(fired).toEqual([]);
  });

  test("a repo_fact citing nothing fires SOURCE_ID_MISMATCH", () => {
    const fired = evaluateClaimLedgerPreconditions([{ provenance: "repo_fact", evidence: [] }], packIds);
    expect(fired.map((f) => f.kind)).toEqual(["SOURCE_ID_MISMATCH"]);
  });

  test("an assumption (no cheapest_verification field in the schema) fires ASSUMPTION_NO_VERIFICATION", () => {
    const fired = evaluateClaimLedgerPreconditions([{ provenance: "assumption", evidence: [] }], packIds);
    expect(fired.map((f) => f.kind)).toEqual(["ASSUMPTION_NO_VERIFICATION"]);
  });

  test("an unlabeled claim fires UNLABELED_CLAIM", () => {
    const fired = evaluateClaimLedgerPreconditions([{ provenance: "", evidence: [] }], packIds);
    expect(fired.map((f) => f.kind)).toEqual(["UNLABELED_CLAIM"]);
  });

  test("a clean labeled + cited claim set fires nothing", () => {
    const fired = evaluateClaimLedgerPreconditions(
      [
        { provenance: "repo_fact", evidence: ["EV-1"] },
        { provenance: "source_claim", evidence: [] },
      ],
      packIds,
    );
    expect(fired).toEqual([]);
  });
});

describe("WU-B2 ratification precondition applier — real flag-gated path", () => {
  // A structured deliberation payload carrying two unverifiable repo_fact claims:
  // one citing an id not in the pack, one citing nothing at all.
  const plantedRepoFact = {
    candidateConsensus: "use Bun",
    claims: [
      { id: "c1", text: "the build script is `bun run x`", provenance: "repo_fact", evidence: ["EV-404"] },
      { id: "c2", text: "an uncited repo assertion", provenance: "repo_fact", evidence: [] },
    ],
  };

  test("flag ON: a planted repo_fact citing a non-existent pack id is surfaced as a FACTUAL_ERROR block", async () => {
    process.env[FLAG] = "1";
    const blocks = await evaluateRatificationPreconditions([proposal(plantedRepoFact)], pack);
    expect(blocks).toHaveLength(1);
    const block = blocks[0]!;
    expect(block.vote.decision).toBe("block");
    expect(block.vote.blockKind).toBe("FACTUAL_ERROR");
    expect(block.accepted).toBe(false);
    expect(block.content).toContain("SOURCE_ID_MISMATCH");
    expect(block.member.name).toBe("Opus 4.8");
  });

  test("flag ON: a clean repo_fact citing a present id raises no block", async () => {
    process.env[FLAG] = "1";
    const clean = proposal({
      candidateConsensus: "use Bun",
      claims: [{ id: "c1", text: "the repo uses Bun", provenance: "repo_fact", evidence: ["EV-1"] }],
    });
    expect(await evaluateRatificationPreconditions([clean], pack)).toEqual([]);
  });

  test("flag OFF: the same planted proposal raises no block (INV-2 — legacy path unchanged)", async () => {
    delete process.env[FLAG];
    expect(await evaluateRatificationPreconditions([proposal(plantedRepoFact)], pack)).toEqual([]);
  });

  test("flag ON: a non-structured (legacy text) proposal is skipped, not blocked", async () => {
    process.env[FLAG] = "1";
    const legacy = proposal("CANDIDATE_CONSENSUS: use Bun\nCONSENSUS_STATUS: CONVERGED");
    expect(await evaluateRatificationPreconditions([legacy], pack)).toEqual([]);
  });
});

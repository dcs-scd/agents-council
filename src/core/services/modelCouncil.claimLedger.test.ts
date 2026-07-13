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

  test("an assumption with no cheapestVerification fires ASSUMPTION_NO_VERIFICATION", () => {
    const fired = evaluateClaimLedgerPreconditions([{ provenance: "assumption", evidence: [] }], packIds);
    expect(fired.map((f) => f.kind)).toEqual(["ASSUMPTION_NO_VERIFICATION"]);
  });

  // The check used to be unwinnable: ClaimSchema declared no cheapestVerification field, so
  // zod stripped it from every payload and EVERY assumption fired. The field now exists, so a
  // member that states its cheapest verification passes — which is what makes the precondition
  // a real gate rather than a tax on honest labeling.
  test("an assumption that states its cheapestVerification fires nothing", () => {
    const fired = evaluateClaimLedgerPreconditions(
      [{ provenance: "assumption", evidence: [], cheapestVerification: "run `bun run build` and read the exit code" }],
      packIds,
    );
    expect(fired).toEqual([]);
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

  // Revised 2026-07-13: a fired precondition is an evidence-hygiene FINDING attributed to the
  // member whose payload tripped it — NOT a synthesized FACTUAL_ERROR veto cast in that
  // member's name. See modelCouncil.preconditionMinority.test.ts for why the veto shape was
  // wrong (it forged votes and turned unanimous ACCEPT_WITH_EDITS slates into `blocked`).
  test("flag ON: a planted repo_fact citing a non-existent pack id is surfaced as a finding, not a vote", async () => {
    process.env[FLAG] = "1";
    const findings = await evaluateRatificationPreconditions([proposal(plantedRepoFact)], pack);
    expect(findings).toHaveLength(1);
    const finding = findings[0]!;
    expect(finding.kinds).toEqual(["SOURCE_ID_MISMATCH"]);
    expect(finding.detail).toContain("SOURCE_ID_MISMATCH");
    expect(finding.member).toBe("Opus 4.8");
    // Structurally not a ballot: nothing here can enter the vote tally.
    expect("vote" in finding).toBe(false);
    expect("accepted" in finding).toBe(false);
  });

  // Identical violations collapse; distinct ones survive. The live run emitted the SAME
  // ASSUMPTION_NO_VERIFICATION sentence seven times for one member — that is noise. Two
  // repo_facts failing for different reasons (a bad id vs. no id at all) are two facts,
  // and both are kept.
  test("flag ON: identical violations collapse to one line; distinct violations are both kept", async () => {
    process.env[FLAG] = "1";
    const twoIdenticalAssumptions = proposal({
      candidateConsensus: "use Bun",
      claims: [
        { id: "c1", text: "probably fast", provenance: "assumption", evidence: [] },
        { id: "c2", text: "probably stable", provenance: "assumption", evidence: [] },
      ],
    });
    const collapsed = await evaluateRatificationPreconditions([twoIdenticalAssumptions], pack);
    expect(collapsed[0]!.kinds).toEqual(["ASSUMPTION_NO_VERIFICATION"]);
    expect(collapsed[0]!.detail.match(/ASSUMPTION_NO_VERIFICATION/g)).toHaveLength(1);

    // plantedRepoFact's two claims trip the same KIND for different REASONS — one kind, two lines.
    const distinct = await evaluateRatificationPreconditions([proposal(plantedRepoFact)], pack);
    expect(distinct[0]!.kinds).toEqual(["SOURCE_ID_MISMATCH"]);
    expect(distinct[0]!.detail.match(/SOURCE_ID_MISMATCH/g)).toHaveLength(2);
  });

  // Regression, live 2026-07-13: `evidence` was a required array, but the prompt describes it
  // as the ids "a repo_fact cites". Opus omitted the key on assumption claims — a correct reading
  // — and zod rejected the ENTIRE payload, which was 100% of that run's structured parse failures
  // (3/3 of one member's deliberation turns). It now defaults to [].
  test("flag ON: a claim that omits `evidence` still parses; an assumption with a stated verification is clean", async () => {
    process.env[FLAG] = "1";
    const omitsEvidence = proposal({
      candidateConsensus: "use Bun",
      claims: [
        // no `evidence` key at all — exactly what Opus emitted live.
        { id: "c1", text: "bun is likely faster here", provenance: "assumption", cheapestVerification: "time both" },
        { id: "c2", text: "the repo uses Bun", provenance: "repo_fact", evidence: ["EV-1"] },
      ],
    });
    // Parses (no longer rejected wholesale) AND is clean: the assumption states its verification,
    // the repo_fact cites a present id.
    expect(await evaluateRatificationPreconditions([omitsEvidence], pack)).toEqual([]);
  });

  // ...but tolerance must not blunt the check: a repo_fact that omits `evidence` cites nothing.
  test("flag ON: a repo_fact that omits `evidence` still fires SOURCE_ID_MISMATCH", async () => {
    process.env[FLAG] = "1";
    const uncited = proposal({
      candidateConsensus: "use Bun",
      claims: [{ id: "c1", text: "the build script is `bun run x`", provenance: "repo_fact" }],
    });
    const findings = await evaluateRatificationPreconditions([uncited], pack);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.kinds).toEqual(["SOURCE_ID_MISMATCH"]);
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

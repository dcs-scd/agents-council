import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { isConverged, saveModelCouncilRun } from "./modelCouncil";
import type { ModelCouncilResult, ModelCouncilRound } from "./modelCouncil";
import { buildIssueMap, normalizeClaimText, type IssueMapClaim } from "./council/issueMap";

// WU-B6: observational, non-controlling issue-map artifact.
//   (a) partition fixture — known agreed/contested claims yield the expected split;
//   (b) controller-isolation assertion — the map is NEVER consulted by isConverged
//       / ratification (INV-3): isConverged's output is identical whether or not an
//       issue-map file exists, and its input surface structurally excludes the map.
//   (c) the persisted issue-map-{ts}.json is written under the flag (INV-2) and not
//       written with the flag off.

describe("WU-B6 issue-map partition (pure, deterministic — INV-5)", () => {
  test("normalizeClaimText folds case/whitespace/surrounding punctuation", () => {
    expect(normalizeClaimText("  Use   Bun. ")).toBe(normalizeClaimText("use bun"));
  });

  test("a claim asserted by >1 distinct member is AGREED; a lone claim is CONTESTED", () => {
    const claims: IssueMapClaim[] = [
      { member: "Opus 4.8", claimId: "a1", text: "The repo uses Bun.", provenance: "repo_fact" },
      { member: "ChatGPT 5.5", claimId: "b1", text: "the repo uses bun", provenance: "repo_fact" },
      { member: "Opus 4.8", claimId: "a2", text: "tests are flaky", provenance: "assumption" },
    ];
    const map = buildIssueMap(claims);
    expect(map.agreed).toHaveLength(1);
    expect(map.agreed[0]!.members.sort()).toEqual(["ChatGPT 5.5", "Opus 4.8"]);
    expect(map.contested).toHaveLength(1);
    expect(map.contested[0]!.members).toEqual(["Opus 4.8"]);
    expect(map.contested[0]!.representativeText).toBe("tests are flaky");
  });

  test("equal member weight: one member repeating a claim does NOT manufacture agreement", () => {
    const claims: IssueMapClaim[] = [
      { member: "Opus 4.8", claimId: "a1", text: "use Bun", provenance: "repo_fact" },
      { member: "Opus 4.8", claimId: "a2", text: "use Bun", provenance: "repo_fact" },
    ];
    const map = buildIssueMap(claims);
    expect(map.agreed).toHaveLength(0);
    expect(map.contested).toHaveLength(1);
    expect(map.contested[0]!.members).toEqual(["Opus 4.8"]);
  });

  // L (post-hydra hardening): claims whose text normalizes to "" (blank or
  // punctuation-only) are dropped at issueMap.ts:92 — they carry no assertion to
  // corroborate, so they must never enter a cluster nor inflate totalClaims.
  test("blank / punctuation-only claims are dropped and do not inflate totalClaims", () => {
    const claims: IssueMapClaim[] = [
      { member: "Opus 4.8", claimId: "a1", text: "   ", provenance: "assumption" },
      { member: "Opus 4.8", claimId: "a2", text: "...", provenance: "assumption" },
      { member: "Opus 4.8", claimId: "a3", text: "", provenance: "assumption" },
      { member: "Opus 4.8", claimId: "a4", text: "a real claim", provenance: "repo_fact" },
    ];
    const map = buildIssueMap(claims);
    expect(map.stats.totalClaims).toBe(1);
    expect(map.stats.distinctClusters).toBe(1);
    expect(map.agreed).toHaveLength(0);
    expect(map.contested).toHaveLength(1);
    expect(map.contested[0]!.representativeText).toBe("a real claim");
  });

  // L (post-hydra hardening): the stats block is the Wave-C misclustering /
  // false-consensus instrument; pin every tally on a known agreed(1)/contested(2)
  // partition so a regression in any counter is caught.
  test("stats tallies count totalClaims / distinctClusters / agreed / contested", () => {
    const claims: IssueMapClaim[] = [
      { member: "Opus 4.8", claimId: "1", text: "use Bun", provenance: "repo_fact" },
      { member: "ChatGPT 5.5", claimId: "2", text: "use bun", provenance: "repo_fact" },
      { member: "Opus 4.8", claimId: "3", text: "tests are flaky", provenance: "assumption" },
      { member: "Gemini", claimId: "4", text: "ship it", provenance: "assumption" },
    ];
    const map = buildIssueMap(claims);
    expect(map.stats).toEqual({
      totalClaims: 4,
      distinctClusters: 3,
      agreedClusters: 1,
      contestedClusters: 2,
    });
  });
});

// --- Controller-isolation assertion (INV-3) ---------------------------------
//
// isConverged is the ONLY live convergence controller in Wave A+B. It takes a
// single ModelCouncilRound and reads only round.changed / similarityToPrevious /
// proposals[].content|candidateConsensus. The issue map is computed in
// saveModelCouncilRun AFTER the result exists and is never threaded back into a
// round, so it has no structural channel into isConverged. We prove this two ways:
//   (1) value isolation — isConverged returns the SAME verdict whether or not an
//       issue-map file has been written to the deliberations dir; the controller's
//       behavior is independent of the artifact.
//   (2) structural isolation — isConverged's input object carries no issue-map
//       field; attaching one as an extra property changes nothing.

function convergedRound(): ModelCouncilRound {
  const claude = { name: "Opus 4.8", model: "claude-test" };
  const codex = { name: "ChatGPT 5.5", model: "codex-test" };
  return {
    index: 2,
    proposals: [
      { member: claude, content: "CONSENSUS_STATUS: CONVERGED", candidateConsensus: "use Bun" },
      { member: codex, content: "CONSENSUS_STATUS: CONVERGED", candidateConsensus: "use Bun" },
    ],
    candidateConsensus: "use Bun",
    changed: true,
    similarityToPrevious: 0.5,
    memberAgreement: 1,
  };
}

describe("WU-B6 issue map is non-controlling (INV-3)", () => {
  const DIR = "AGENTS_COUNCIL_DELIBERATIONS_DIR";
  const FLAG = "AGENTS_COUNCIL_STRUCTURED";
  const priorDir = process.env[DIR];
  const priorFlag = process.env[FLAG];
  let outDir: string;

  beforeEach(async () => {
    outDir = await mkdtemp(path.join(tmpdir(), "council-issuemap-"));
    process.env[DIR] = outDir;
  });
  afterEach(async () => {
    if (priorDir === undefined) delete process.env[DIR];
    else process.env[DIR] = priorDir;
    if (priorFlag === undefined) delete process.env[FLAG];
    else process.env[FLAG] = priorFlag;
    await rm(outDir, { recursive: true, force: true });
  });

  test("structural isolation: isConverged ignores an attached issue-map field", () => {
    const round = convergedRound();
    const before = isConverged(round);
    // Forge a maximally agreed issue map onto the round; if the controller read it,
    // the verdict could change. It does not — the field is structurally invisible.
    const polluted = { ...round, issueMap: buildIssueMap([]) } as unknown as ModelCouncilRound;
    expect(isConverged(polluted)).toBe(before);
  });

  test("value isolation: writing an issue-map file does not change isConverged's verdict", async () => {
    process.env[FLAG] = "1";
    const round = convergedRound();
    const verdictNoFile = isConverged(round);

    // Produce a real issue-map-{ts}.json next to the council artifacts.
    const result: ModelCouncilResult = {
      prompt: "q",
      members: [
        { id: "claude", name: "Opus 4.8", provider: "claude", model: "claude-test" },
        { id: "chatgpt", name: "ChatGPT 5.5", provider: "codex", model: "codex-test" },
      ],
      responses: [],
      deliberations: [],
      rounds: [
        {
          ...round,
          index: 1,
          proposals: round.proposals.map((p) => ({
            ...p,
            content: JSON.stringify({
              candidateConsensus: "use Bun",
              claims: [{ id: "c1", text: "use Bun", provenance: "repo_fact", evidence: ["EV-1"] }],
            }),
          })),
        },
      ],
      candidateConsensus: "use Bun",
      converged: true,
      ratifications: [],
      consensus: { reached: true, outcome: "ratified", ratifiedBy: ["Opus 4.8", "ChatGPT 5.5"], blockedBy: [] },
    };
    await saveModelCouncilRun(result);
    const names = await readdir(outDir);
    expect(names.some((n) => n.startsWith("issue-map-"))).toBe(true);

    // The controller's verdict is unchanged by the artifact's existence/content.
    expect(isConverged(round)).toBe(verdictNoFile);
  });

  test("flag OFF: no issue-map file is written (INV-2)", async () => {
    delete process.env[FLAG];
    const result: ModelCouncilResult = {
      prompt: "q",
      members: [{ id: "claude", name: "Opus 4.8", provider: "claude", model: "claude-test" }],
      responses: [],
      deliberations: [],
      rounds: [],
      candidateConsensus: "",
      converged: false,
      ratifications: [],
      consensus: { reached: false, outcome: "not_attempted", ratifiedBy: [], blockedBy: [] },
    };
    await saveModelCouncilRun(result);
    const names = await readdir(outDir);
    expect(names.some((n) => n.startsWith("issue-map-"))).toBe(false);
  });
});

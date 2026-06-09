import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { saveModelCouncilRun } from "./modelCouncil";
import type { ModelCouncilResult } from "./modelCouncil";

// WU-B5: structured trace logging (no learner). Under AGENTS_COUNCIL_STRUCTURED
// only, saveModelCouncilRun writes a per-claim / per-member / per-round trace file
// alongside council-{ts}.json/.md. Asserted here:
//   (1) flag ON writes trace-{ts}.json whose schema matches the
//       council_to_brief.py consumer contract (deliberations/*.json field shape);
//   (2) equal member weights — every member carries weight 1, never by prestige;
//   (3) the per-claim/per-member/per-round detail is present;
//   (4) INV-2 — flag OFF writes NO trace file (legacy output byte-for-byte).

const FLAG = "AGENTS_COUNCIL_STRUCTURED";
const DIR = "AGENTS_COUNCIL_DELIBERATIONS_DIR";
const priorFlag = process.env[FLAG];
const priorDir = process.env[DIR];
let outDir: string;

beforeEach(async () => {
  outDir = await mkdtemp(path.join(tmpdir(), "council-trace-"));
  process.env[DIR] = outDir;
});
afterEach(async () => {
  if (priorFlag === undefined) delete process.env[FLAG];
  else process.env[FLAG] = priorFlag;
  if (priorDir === undefined) delete process.env[DIR];
  else process.env[DIR] = priorDir;
  await rm(outDir, { recursive: true, force: true });
});

// A structured deliberation payload (what a member emits under the flag): a
// candidate plus typed claims.
function structuredContent(candidate: string, claims: unknown[]): string {
  return JSON.stringify({ candidateConsensus: candidate, claims });
}

function makeResult(): ModelCouncilResult {
  const claudeClaims = [
    { id: "c1", text: "the repo uses Bun", provenance: "repo_fact", evidence: ["EV-1"] },
    { id: "c2", text: "tests live under src", provenance: "source_claim", evidence: [] },
  ];
  const codexClaims = [{ id: "d1", text: "the repo uses Bun", provenance: "repo_fact", evidence: ["EV-1"] }];
  const claude = { name: "Opus 4.8", model: "claude-test" };
  const codex = { name: "ChatGPT 5.5", model: "codex-test" };
  return {
    prompt: "which runtime?",
    members: [
      { id: "claude", name: "Opus 4.8", provider: "claude", model: "claude-test" },
      { id: "chatgpt", name: "ChatGPT 5.5", provider: "codex", model: "codex-test" },
    ],
    responses: [
      { member: claude, content: "" },
      { member: codex, content: "" },
    ],
    deliberations: [],
    rounds: [
      {
        index: 1,
        proposals: [
          { member: claude, content: structuredContent("use Bun", claudeClaims), candidateConsensus: "use Bun" },
          { member: codex, content: structuredContent("use Bun", codexClaims), candidateConsensus: "use Bun" },
        ],
        candidateConsensus: "use Bun",
        changed: true,
        similarityToPrevious: null,
        memberAgreement: 1,
      },
    ],
    candidateConsensus: "use Bun",
    converged: true,
    ratifications: [],
    consensus: { reached: true, outcome: "ratified", ratifiedBy: ["Opus 4.8", "ChatGPT 5.5"], blockedBy: [] },
  };
}

async function findFile(prefix: string): Promise<string | undefined> {
  const names = await readdir(outDir);
  return names.find((n) => n.startsWith(prefix));
}

describe("WU-B5 structured trace logging", () => {
  test("flag ON: writes trace-{ts}.json matching the council_to_brief.py contract", async () => {
    process.env[FLAG] = "1";
    await saveModelCouncilRun(makeResult());

    const traceName = await findFile("trace-");
    expect(traceName).toBeDefined();
    const trace = JSON.parse(await readFile(path.join(outDir, traceName!), "utf8"));

    // Consumer contract (council_to_brief._REQUIRED_TOP_KEYS): prompt, members,
    // consensus, converged, rounds — plus the consensus required keys.
    for (const key of ["prompt", "members", "consensus", "converged", "rounds"]) {
      expect(trace).toHaveProperty(key);
    }
    for (const key of ["reached", "ratifiedBy", "blockedBy"]) {
      expect(trace.consensus).toHaveProperty(key);
    }
    expect(Array.isArray(trace.consensus.ratifiedBy)).toBe(true);
    expect(Array.isArray(trace.consensus.blockedBy)).toBe(true);
    // members carry the {id,name,provider,model} shape the parser projects.
    for (const m of trace.members) {
      for (const key of ["id", "name", "provider", "model"]) expect(m).toHaveProperty(key);
    }
    // rounds carry the {index, changed, memberAgreement} the parser reads.
    for (const r of trace.rounds) {
      for (const key of ["index", "changed", "memberAgreement"]) expect(r).toHaveProperty(key);
    }
  });

  test("flag ON: equal member weights — every member carries weight 1, never by prestige", async () => {
    process.env[FLAG] = "1";
    await saveModelCouncilRun(makeResult());
    const traceName = await findFile("trace-");
    const trace = JSON.parse(await readFile(path.join(outDir, traceName!), "utf8"));
    expect(trace.members.map((m: { weight: number }) => m.weight)).toEqual([1, 1]);
  });

  test("flag ON: per-claim / per-member / per-round detail is present", async () => {
    process.env[FLAG] = "1";
    await saveModelCouncilRun(makeResult());
    const traceName = await findFile("trace-");
    const trace = JSON.parse(await readFile(path.join(outDir, traceName!), "utf8"));
    // 2 claude claims + 1 codex claim = 3, all tagged with round/member.
    expect(trace.claims).toHaveLength(3);
    const c1 = trace.claims[0];
    for (const key of ["round", "member", "claimId", "text", "provenance", "evidence"]) {
      expect(c1).toHaveProperty(key);
    }
    expect(c1.round).toBe(1);
    expect(trace.claims.map((c: { member: string }) => c.member)).toEqual(["Opus 4.8", "Opus 4.8", "ChatGPT 5.5"]);
  });

  test("flag OFF: writes NO trace file (INV-2 — legacy output byte-for-byte)", async () => {
    delete process.env[FLAG];
    await saveModelCouncilRun(makeResult());
    expect(await findFile("trace-")).toBeUndefined();
    expect(await findFile("issue-map-")).toBeUndefined();
    // The legacy council-{ts}.json/.md are still the only artifacts.
    const names = await readdir(outDir);
    expect(names.some((n) => n.startsWith("council-") && n.endsWith(".json"))).toBe(true);
    expect(names.some((n) => n.startsWith("council-") && n.endsWith(".md"))).toBe(true);
  });
});

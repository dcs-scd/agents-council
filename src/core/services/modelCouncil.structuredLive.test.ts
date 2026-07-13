import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  buildDeliberationMessages,
  buildRatificationMessages,
  fuseConsensusSignals,
  fuseRatificationVotes,
  isConverged,
  parseCandidateConsensusStructured,
  parseConsensusSignalStructured,
  parseRatificationVoteStructured,
  runModelCouncil,
  saveModelCouncilRun,
  type ConsensusSignal,
  type EvidencePackEntry,
  type ModelCouncilMember,
  type ModelCouncilResponse,
  type ModelCouncilRound,
  type StructuredParseOutcome,
} from "./modelCouncil";

// Lane D: the structured (Claim-Ledger Delphi) subsystem goes LIVE behind the
// existing AGENTS_COUNCIL_STRUCTURED flag (rollout stage v2 — protocol switch).
//   D1 — deliberation/ratification prompts request a fenced ```json payload
//        (flag-gated; flag off the prompts are BYTE-identical to the merged base,
//        pinned below by sha256 of the canonical message JSON).
//   D2 — the live loop reads member replies through the parse*Structured
//        wrappers: a schema-valid fenced payload is read, anything else falls back
//        to the legacy text parse. REVISED 2026-07-13: the payload no longer
//        *overrides* the prose markers it was declared additive to — the two
//        channels are FUSED fail-safe (see the fusion describe block below).
//   D3 — per-member/per-phase parse ok/fail/absent accrues on the result and is
//        persisted in trace-{ts}.json so the operator can compute the <5%
//        promotion criterion from saved traces alone.
//   D4 — with the flag on, a payload whose repo_fact cites a mismatched source
//        id trips the WU-B2 precondition and surfaces as a synthetic
//        FACTUAL_ERROR block, end-to-end through runModelCouncil.

const FLAG = "AGENTS_COUNCIL_STRUCTURED";
const TOUCHED_ENV = [
  FLAG,
  "AGENTS_COUNCIL_MEMBERS",
  "AGENTS_COUNCIL_ALLOW_SOLO",
  "OPENROUTER_API_KEY",
  "AGENTS_COUNCIL_OPENROUTER_URL",
  "AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS",
  "AGENTS_COUNCIL_MAX_ROUNDS",
  "AGENTS_COUNCIL_DELIBERATIONS_DIR",
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

const member: ModelCouncilMember = { id: "claude", name: "Opus 4.8", provider: "claude", model: "claude-test" };
const responses: ModelCouncilResponse[] = [
  { member: { name: "Opus 4.8", model: "claude-test" }, content: "initial proposal" },
];
const previous = [
  { member: { name: "Opus 4.8", model: "claude-test" }, content: "prior reply", candidateConsensus: "use Bun" },
];
const rounds: ModelCouncilRound[] = [
  {
    index: 1,
    proposals: previous,
    candidateConsensus: "use Bun",
    changed: true,
    similarityToPrevious: null,
    memberAgreement: 1,
  },
];

function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

// sha256 of JSON.stringify(messages) for the fixtures above, captured at the
// merged Lanes A+B+C base (pre-Lane-D) with the flag off. Any flag-off prompt
// drift from the base fails here byte-for-byte.
const BASE_DELIBERATION_SHA = "15ba2de5eb3e0cf0dc41ed18e429f70c8e75d769151bf37b1d9d433afbb41e5e";
const BASE_RATIFICATION_SHA = "7e535e22b3228946d7905384644df456d6d7f5b75b6fbd06fc05cd03e935c3bd";

describe("D1 prompts — flag off byte-identical, flag on additive payload request", () => {
  test("flag OFF: deliberation + ratification prompts are byte-identical to the merged base (no structured text)", () => {
    delete process.env[FLAG];
    const delib = buildDeliberationMessages("which runtime?", responses, previous, "use Bun", member, 2);
    const ratify = buildRatificationMessages("which runtime?", rounds, "use Bun", member, undefined);
    expect(sha256(delib)).toBe(BASE_DELIBERATION_SHA);
    expect(sha256(ratify)).toBe(BASE_RATIFICATION_SHA);
    for (const messages of [delib, ratify]) {
      const flat = JSON.stringify(messages);
      expect(flat).not.toContain("```json");
      expect(flat.toLowerCase()).not.toContain("structured");
    }
  });

  test("flag ON: both prompts additionally request the fenced ```json payload (legacy markers still required)", () => {
    process.env[FLAG] = "1";
    const delib = JSON.stringify(
      buildDeliberationMessages("which runtime?", responses, previous, "use Bun", member, 2),
    );
    const ratify = JSON.stringify(buildRatificationMessages("which runtime?", rounds, "use Bun", member, undefined));
    for (const flat of [delib, ratify]) {
      expect(flat).toContain("```json");
      expect(flat).toContain("The marker");
      expect(flat).toContain("additive");
    }
    // The payload shapes mirror the zod schemas (keys are JSON-escaped in flat).
    expect(delib).toContain("candidateConsensus");
    expect(delib).toContain("provenance");
    expect(ratify).toContain("decision");
    expect(ratify).toContain("blockKind");
    // Legacy marker instructions are still present (the payload is additive).
    expect(delib).toContain("CANDIDATE_CONSENSUS:");
    expect(ratify).toContain("CONSENSUS: ACCEPT");
  });
});

// A reply in the D1 contract: legacy markers plus a trailing fenced payload.
function fenced(markers: string, payload: string): string {
  return `${markers}\n\`\`\`json\n${payload}\n\`\`\``;
}

describe("D2/D3 structured wrappers — fenced payload is read, fallback + outcome accrual", () => {
  // Revised 2026-07-13. This test used to plant `CONSENSUS: BLOCK` in the prose and
  // `{"decision":"accept"}` in the fence and assert the vote came out ACCEPT — i.e. it
  // pinned veto-erasure as the intended contract. It is not: see the fusion block below.
  // What the payload legitimately does is carry detail the markers left implicit, which is
  // what this now proves (the fence is still read, outcome still accrues "ok").
  test("flag ON: the fenced vote payload is read; it supplies the edits the marker left out", async () => {
    process.env[FLAG] = "1";
    const outcomes: StructuredParseOutcome[] = [];
    const content = fenced(
      "CONSENSUS: ACCEPT_WITH_EDITS",
      '{ "decision": "accept_with_edits", "requiredEdits": "cite the benchmark" }',
    );
    const vote = await parseRatificationVoteStructured(content, (outcome) => outcomes.push(outcome));
    expect(vote.decision).toBe("accept_with_edits");
    expect(vote.requiredEdits).toBe("cite the benchmark");
    expect(vote.raw).toBe(content);
    expect(outcomes).toEqual(["ok"]);
  });

  test("flag ON: invalid JSON in the fence falls back to the legacy marker; outcome fail", async () => {
    process.env[FLAG] = "1";
    const outcomes: StructuredParseOutcome[] = [];
    const vote = await parseRatificationVoteStructured(fenced("CONSENSUS: ACCEPT", "{not json"), (outcome) =>
      outcomes.push(outcome),
    );
    expect(vote.decision).toBe("accept");
    expect(outcomes).toEqual(["fail"]);
  });

  test("flag ON: schema-invalid payload falls back to the legacy marker; outcome fail", async () => {
    process.env[FLAG] = "1";
    const outcomes: StructuredParseOutcome[] = [];
    const vote = await parseRatificationVoteStructured(
      fenced("CONSENSUS: ACCEPT", '{ "decision": "maybe" }'),
      (outcome) => outcomes.push(outcome),
    );
    expect(vote.decision).toBe("accept");
    expect(outcomes).toEqual(["fail"]);
  });

  test("flag ON: a payload-less legacy reply parses legacy; outcome absent", async () => {
    process.env[FLAG] = "1";
    const outcomes: StructuredParseOutcome[] = [];
    const vote = await parseRatificationVoteStructured("CONSENSUS: ACCEPT", (outcome) => outcomes.push(outcome));
    expect(vote.decision).toBe("accept");
    expect(outcomes).toEqual(["absent"]);
  });

  test("flag ON: candidate wrapper prefers the payload candidate, then marker, then raw reply", async () => {
    process.env[FLAG] = "1";
    const outcomes: StructuredParseOutcome[] = [];
    const record = (outcome: StructuredParseOutcome) => outcomes.push(outcome);
    const payload = '{ "candidateConsensus": "payload candidate", "claims": [] }';
    expect(
      await parseCandidateConsensusStructured(fenced("CANDIDATE_CONSENSUS: marker candidate", payload), record),
    ).toBe("payload candidate");
    expect(
      await parseCandidateConsensusStructured(fenced("CANDIDATE_CONSENSUS: marker candidate", "{oops"), record),
    ).toBe(
      // Legacy fallback: everything after the marker, including the broken fence.
      "marker candidate\n```json\n{oops\n```",
    );
    expect(await parseCandidateConsensusStructured("no marker at all", record)).toBe("no marker at all");
    expect(outcomes).toEqual(["ok", "fail", "absent"]);
  });

  // Unchanged assertions, renamed 2026-07-13: this passes under fusion too, but for a
  // different reason. It is NOT "the payload beats the markers" (it no longer does) — it is
  // that `diverged` is absorbing, so the payload's DIVERGED survives a prose CONVERGED. The
  // symmetric case (payload CONVERGED over prose DIVERGED) is the hazard, and is pinned below.
  test("flag ON: a payload DIVERGED survives a prose CONVERGED (diverged is absorbing)", async () => {
    process.env[FLAG] = "1";
    const outcomes: StructuredParseOutcome[] = [];
    const payload =
      '{ "candidateConsensus": "use Bun", "claims": [], "consensusStatus": "diverged", "materialDisagreements": ["runtime choice"] }';
    const signal = await parseConsensusSignalStructured(
      fenced("CONSENSUS_STATUS: CONVERGED\nMATERIAL_DISAGREEMENTS: NONE\nCANDIDATE_CONSENSUS: use Bun", payload),
      (outcome) => outcomes.push(outcome),
    );
    expect(signal.status).toBe("diverged");
    expect(signal.hasMaterialDisagreements).toBe(true);
    expect(signal.disagreements).toBe("runtime choice");
    expect(outcomes).toEqual(["ok"]);
  });

  test("flag OFF: wrappers are the legacy parsers and record nothing", async () => {
    delete process.env[FLAG];
    const outcomes: StructuredParseOutcome[] = [];
    const record = (outcome: StructuredParseOutcome) => outcomes.push(outcome);
    const vote = await parseRatificationVoteStructured(
      fenced("CONSENSUS: BLOCK\nBLOCK_KIND: PROTOCOL", '{ "decision": "accept" }'),
      record,
    );
    // Legacy parse: the fenced payload is ignored entirely.
    expect(vote.decision).toBe("block");
    expect(vote.blockKind).toBe("PROTOCOL");
    const signal = await parseConsensusSignalStructured(
      fenced("CONSENSUS_STATUS: CONVERGED\nMATERIAL_DISAGREEMENTS: NONE", '{ "consensusStatus": "diverged" }'),
      record,
    );
    expect(signal.status).toBe("converged");
    expect(outcomes).toEqual([]);
  });

  test("isConverged accepts pre-parsed structured signals over the legacy markers", () => {
    const round: ModelCouncilRound = {
      index: 1,
      proposals: [
        {
          member: { name: "Opus 4.8", model: "claude-test" },
          content: "CONSENSUS_STATUS: DIVERGED\nMATERIAL_DISAGREEMENTS: runtime\nCANDIDATE_CONSENSUS: draft A",
          candidateConsensus: "draft A",
        },
      ],
      candidateConsensus: "draft A",
      changed: true,
      similarityToPrevious: null,
      memberAgreement: 0,
    };
    // Legacy markers say DIVERGED — not converged without structured signals.
    expect(isConverged(round)).toBe(false);
    const structured: ConsensusSignal[] = [{ status: "converged", hasMaterialDisagreements: false, disagreements: "" }];
    expect(isConverged(round, structured)).toBe(true);
  });
});

// Two-channel fusion (2026-07-13). The structured payload is declared ADDITIVE to the legacy
// markers ("the marker sections above remain required"), so every flag-on reply says the same
// thing twice. The wrappers used to read only the JSON and discard the prose — which meant a
// member could veto in prose and accept in its fence, and the engine would take the accept.
// The two channels are now fused fail-safe: toward keeping a veto, toward more deliberation.
describe("two-channel fusion — the payload cannot silently overrule the prose it was added to", () => {
  test("prose BLOCK + payload accept => BLOCK: an absolute veto cannot be erased by the fence", async () => {
    process.env[FLAG] = "1";
    const content = fenced("CONSENSUS: BLOCK\nBLOCK_KIND: FACTUAL_ERROR", '{ "decision": "accept" }');
    const vote = await parseRatificationVoteStructured(content);
    expect(vote.decision).toBe("block");
    // The kind is preserved, so the veto keeps its absolute classification downstream.
    expect(vote.blockKind).toBe("FACTUAL_ERROR");
  });

  test("prose ACCEPT + payload block => BLOCK: fusion is symmetric, always the stricter channel", async () => {
    process.env[FLAG] = "1";
    const content = fenced("CONSENSUS: ACCEPT", '{ "decision": "block", "blockKind": "MATERIAL_DISAGREEMENT" }');
    const vote = await parseRatificationVoteStructured(content);
    expect(vote.decision).toBe("block");
    expect(vote.blockKind).toBe("MATERIAL_DISAGREEMENT");
  });

  // The other direction of the fail-safe: a MISSING prose marker is not a veto. The legacy
  // parser maps markerless => PROTOCOL block; naively fusing that would manufacture a false
  // block for any member that answered cleanly in JSON and skipped the marker line — the very
  // false-veto pathology Lane A removed. A silent prose channel is absence of evidence.
  test("no prose marker + payload accept => ACCEPT: a silent prose channel manufactures no veto", async () => {
    process.env[FLAG] = "1";
    const vote = await parseRatificationVoteStructured(
      fenced("I agree with the synthesis.", '{ "decision": "accept" }'),
    );
    expect(vote.decision).toBe("accept");
  });

  test("payload CONVERGED + prose disagreements => not converged: the round keeps deliberating", async () => {
    process.env[FLAG] = "1";
    // The live specimen: schema-valid, self-reported converged, empty disagreements — while
    // the same member's prose markers list a material disagreement.
    const payload =
      '{ "candidateConsensus": "use Bun", "claims": [], "consensusStatus": "converged", "materialDisagreements": [] }';
    const signal = await parseConsensusSignalStructured(
      fenced("CONSENSUS_STATUS: CONVERGED\nMATERIAL_DISAGREEMENTS: the benchmark is unsound", payload),
      undefined,
    );
    expect(signal.hasMaterialDisagreements).toBe(true);
    expect(signal.disagreements).toBe("the benchmark is unsound");

    // ...and that is what isConverged consumes, so the loop does not early-stop.
    const round: ModelCouncilRound = {
      index: 1,
      proposals: [
        { member: { name: "Opus 4.8", model: "claude-test" }, content: "irrelevant", candidateConsensus: "use Bun" },
      ],
      candidateConsensus: "use Bun",
      changed: true,
      similarityToPrevious: null,
      memberAgreement: 0,
    };
    expect(isConverged(round, [signal])).toBe(false);
  });

  test("payload CONVERGED + prose DIVERGED => diverged", async () => {
    process.env[FLAG] = "1";
    const payload = '{ "candidateConsensus": "use Bun", "claims": [], "consensusStatus": "converged" }';
    const signal = await parseConsensusSignalStructured(fenced("CONSENSUS_STATUS: DIVERGED", payload));
    expect(signal.status).toBe("diverged");
  });

  test("agreeing channels fuse to themselves; a prose-silent reply fuses to exactly the payload", () => {
    const agree = fuseConsensusSignals(
      { status: "converged", hasMaterialDisagreements: false, disagreements: "" },
      { status: "converged", hasMaterialDisagreements: false, disagreements: "NONE" },
    );
    expect(agree).toEqual({ status: "converged", hasMaterialDisagreements: false, disagreements: "" });

    // No prose markers at all => the legacy parse yields `unknown`, which is neutral: the
    // fused signal is the payload's own. This is what keeps the JSON-only reply unchanged.
    const payloadOnly = fuseConsensusSignals(
      { status: "converged", hasMaterialDisagreements: false, disagreements: "" },
      { status: "unknown", hasMaterialDisagreements: false, disagreements: "" },
    );
    expect(payloadOnly.status).toBe("converged");

    const voteOnly = fuseRatificationVotes(
      { decision: "accept", raw: "r" },
      { decision: "block", blockKind: "PROTOCOL", raw: "r" },
      false, // no prose marker present — the block is the markerless PROTOCOL fallback
    );
    expect(voteOnly.decision).toBe("accept");
  });

  test("distinct disagreements from both channels are unioned; duplicates collapse", () => {
    const fused = fuseConsensusSignals(
      { status: "converged", hasMaterialDisagreements: true, disagreements: "the benchmark is unsound" },
      { status: "converged", hasMaterialDisagreements: true, disagreements: "the runtime choice is unsettled" },
    );
    expect(fused.disagreements).toBe("the benchmark is unsound; the runtime choice is unsettled");

    const deduped = fuseConsensusSignals(
      { status: "diverged", hasMaterialDisagreements: true, disagreements: "same objection" },
      { status: "diverged", hasMaterialDisagreements: true, disagreements: "same objection" },
    );
    expect(deduped.disagreements).toBe("same objection");
  });

  test("flag OFF: fusion is unreachable — the legacy parsers ignore the fence entirely", async () => {
    delete process.env[FLAG];
    const vote = await parseRatificationVoteStructured(
      fenced("CONSENSUS: ACCEPT", '{ "decision": "block", "blockKind": "FACTUAL_ERROR" }'),
    );
    // Legacy: the prose marker is the ONLY channel. The fence's block is not read at all.
    expect(vote.decision).toBe("accept");
  });
});

// Minimal mock OpenRouter transport: reply with the next canned body per call,
// falling back to the last (mirrors modelCouncil.preconditionMinority.test.ts).
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

describe("D4 end-to-end — fenced SOURCE_ID_MISMATCH payload is reported as a finding; D3 stats reach the trace", () => {
  const pack: EvidencePackEntry[] = [{ id: "EV-1", text: "The repo uses Bun.", source: "package.json" }];

  // The D1 contract reply: legacy markers, then the fenced payload whose
  // repo_fact cites EV-404 — absent from the pack -> SOURCE_ID_MISMATCH.
  const deliberationReply = fenced(
    [
      "Critique of the peers.",
      "CONSENSUS_STATUS: CONVERGED",
      "MATERIAL_DISAGREEMENTS: NONE",
      "PREFERRED_DRAFT: SELF",
      "CANDIDATE_CONSENSUS: use Bun",
    ].join("\n"),
    JSON.stringify({
      candidateConsensus: "use Bun",
      claims: [{ id: "c1", text: "the build script is `bun run x`", provenance: "repo_fact", evidence: ["EV-404"] }],
      consensusStatus: "converged",
      materialDisagreements: [],
    }),
  );
  const ratificationReply = fenced("CONSENSUS: ACCEPT\nMatches the source.", '{ "decision": "accept" }');

  let outDir: string;
  beforeEach(async () => {
    outDir = await mkdtemp(path.join(tmpdir(), "council-lane-d-"));
  });
  afterEach(async () => {
    await rm(outDir, { recursive: true, force: true });
  });

  test("a mismatched source id in a fenced payload produces a claim-ledger finding, not a block", async () => {
    const server = mockOpenRouter(["Initial independent answer.", deliberationReply, ratificationReply]);
    process.env[FLAG] = "1";
    process.env.AGENTS_COUNCIL_MEMBERS = "kimi";
    process.env.AGENTS_COUNCIL_ALLOW_SOLO = "1";
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENTS_COUNCIL_OPENROUTER_URL = server.url;
    process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS = "5000";
    process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";
    process.env.AGENTS_COUNCIL_DELIBERATIONS_DIR = outDir;
    try {
      const result = await runModelCouncil({ prompt: "What is the build script?", evidencePack: pack });

      // D4 (revised 2026-07-13): the WU-B2 precondition fired on the fenced payload and is
      // reported as an evidence-hygiene finding. It no longer synthesizes a FACTUAL_ERROR
      // veto in the member's name, so the member's own ACCEPT decides the outcome.
      expect(result.consensus.outcome).toBe("ratified");
      expect(result.preconditionFindings).toBeDefined();
      expect(result.preconditionFindings![0]!.kinds).toContain("SOURCE_ID_MISMATCH");
      expect(result.ratifications.some((entry) => entry.content.includes("SOURCE_ID_MISMATCH"))).toBe(false);
      // D2: the live candidate came from the structured payload, not the raw reply.
      expect(result.candidateConsensus).toBe("use Bun");

      // D3: parse outcomes accrued per member/phase on the result...
      expect(result.structuredParseStats).toEqual([
        { member: "Kimi K2.6", phase: "deliberation", ok: 1, fail: 0, absent: 0 },
        { member: "Kimi K2.6", phase: "ratification", ok: 1, fail: 0, absent: 0 },
      ]);

      // ...and are persisted into trace-{ts}.json for offline promotion accounting.
      await saveModelCouncilRun(result);
      const traceName = (await readdir(outDir)).find((name) => name.startsWith("trace-"));
      expect(traceName).toBeDefined();
      const trace = JSON.parse(await readFile(path.join(outDir, traceName!), "utf8"));
      expect(trace.parseStats).toEqual([
        { member: "Kimi K2.6", phase: "deliberation", ok: 1, fail: 0, absent: 0 },
        { member: "Kimi K2.6", phase: "ratification", ok: 1, fail: 0, absent: 0 },
      ]);
      // The fenced payload's claims reached the trace too (extraction end-to-end).
      expect(trace.claims).toHaveLength(1);
      expect(trace.claims[0].claimId).toBe("c1");
    } finally {
      server.stop();
    }
  }, 30000);
});

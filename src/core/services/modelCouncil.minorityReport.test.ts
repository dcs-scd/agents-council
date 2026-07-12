import { describe, expect, test } from "bun:test";
import path from "node:path";

import {
  buildConsensusResult,
  formatModelCouncilMarkdown,
  parseRatificationVote,
  type MemberRef,
  type ModelCouncilCandidateProposal,
  type ModelCouncilMember,
  type ModelCouncilRatification,
  type ModelCouncilResponse,
  type ModelCouncilResult,
  type ModelCouncilRound,
} from "./modelCouncil";

// WU-B4 — minority report as a first-class artifact (gate_minority_report).
//
// Proves a single absolute veto (a FACTUAL_ERROR — the same block kind the WU-B2
// claim-ledger preconditions raise) preserves the dissent in BOTH the JSON result
// (`consensus.minorityReport[]`) AND the rendered Markdown, and that the CLI exits
// non-zero on a `blocked` outcome and zero on `ratified`. INV-6: the top-level
// outcome enum is never touched — the minority report is an additional field.

// Build a ratification exactly as the engine does, so the fixture vote never
// drifts from the parser (matches the harness in modelCouncil.test.ts).
function ratification(member: MemberRef, content: string): ModelCouncilRatification {
  const vote = parseRatificationVote(content);
  return { member, content, accepted: vote.decision === "accept", vote };
}

const members: ModelCouncilMember[] = [
  { id: "kimi", name: "Kimi K2.6", provider: "openrouter", model: "kimi-test" },
  { id: "deepseek", name: "DeepSeek V4 Pro", provider: "openrouter", model: "deepseek-test" },
];

const responses: ModelCouncilResponse[] = members.map((member) => ({
  member,
  content: `${member.name} proposal`,
}));

const candidateProposals: ModelCouncilCandidateProposal[] = members.map((member) => ({
  member,
  content: `${member.name} critique\n\nCANDIDATE_CONSENSUS:\nShared candidate from ${member.name}`,
  candidateConsensus: `Shared candidate from ${member.name}`,
}));

const rounds: ModelCouncilRound[] = [
  {
    index: 1,
    proposals: candidateProposals,
    candidateConsensus: "Shared candidate",
    changed: true,
    similarityToPrevious: null,
    memberAgreement: 1,
  },
];

// The dissent text carried by the single blocking veto.
const VETO_DISSENT = "The source lists nine backends, not five.";

function blockedResult(): ModelCouncilResult {
  const ratifications: ModelCouncilRatification[] = [
    ratification(members[0]!, "CONSENSUS: ACCEPT\nMatches the source."),
    ratification(members[1]!, `CONSENSUS: BLOCK\nBLOCK_KIND: FACTUAL_ERROR\n${VETO_DISSENT}`),
  ];
  return {
    prompt: "How many backends does the registry have?",
    members,
    responses,
    deliberations: candidateProposals,
    rounds,
    candidateConsensus: "The registry has exactly five backends.",
    converged: true,
    ratifications,
    consensus: buildConsensusResult(ratifications, members),
  };
}

describe("WU-B4 minority report (JSON result)", () => {
  test("one absolute veto records the dissent in consensus.minorityReport[]", () => {
    const consensus = blockedResult().consensus;

    expect(consensus.outcome).toBe("blocked");
    expect(consensus.minorityReport).toBeDefined();
    expect(consensus.minorityReport).toHaveLength(1);

    const entry = consensus.minorityReport![0]!;
    expect(entry.member).toBe(members[1]!.name);
    expect(entry.blockKind).toBe("FACTUAL_ERROR");
    expect(entry.absolute).toBe(true);
    expect(entry.dissent).toContain(VETO_DISSENT);
  });

  test("a ratified outcome carries no minority report", () => {
    const ratifications = members.map((member) => ratification(member, "CONSENSUS: ACCEPT"));
    const consensus = buildConsensusResult(ratifications, members);

    expect(consensus.outcome).toBe("ratified");
    expect(consensus.minorityReport).toBeUndefined();
  });

  test("not_attempted carries no minority report", () => {
    const consensus = buildConsensusResult([], members);

    expect(consensus.outcome).toBe("not_attempted");
    expect(consensus.minorityReport).toBeUndefined();
  });
});

describe("WU-B4 minority report (Markdown)", () => {
  test("a blocked result renders the dissent in a Minority Report section", () => {
    const markdown = formatModelCouncilMarkdown(blockedResult());

    expect(markdown).toContain("## Minority Report");
    expect(markdown).toContain(VETO_DISSENT);
    // The veto's member and absolute-veto kind are surfaced in the section heading.
    expect(markdown).toContain(`### ${members[1]!.name} — FACTUAL_ERROR (absolute veto)`);
  });

  test("a ratified result renders no Minority Report section", () => {
    const ratifications = members.map((member) => ratification(member, "CONSENSUS: ACCEPT"));
    const result: ModelCouncilResult = {
      ...blockedResult(),
      candidateConsensus: "Shared candidate",
      ratifications,
      consensus: buildConsensusResult(ratifications, members),
    };

    const markdown = formatModelCouncilMarkdown(result);
    expect(markdown).not.toContain("## Minority Report");
  });
});

// End-to-end CLI exit-code proof: spawn the real `council solve` binary against a
// mock OpenRouter transport, so the actual src/cli/index.ts exit-code path is the
// thing under test (not a reimplementation). One member keeps the canned-call
// sequence short: propose → deliberate (converges) → ratify.
const CLI_ENTRY = path.join(import.meta.dir, "..", "..", "cli", "index.ts");

async function runCliWithCannedReplies(cannedByCall: string[]): Promise<number> {
  let callIndex = 0;
  const server = Bun.serve({
    port: 0,
    fetch: () => {
      const content = cannedByCall[callIndex] ?? cannedByCall[cannedByCall.length - 1];
      callIndex += 1;
      return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
        headers: { "Content-Type": "application/json" },
      });
    },
  });
  try {
    const proc = Bun.spawn(["bun", CLI_ENTRY, "solve", "How many backends does the registry have?"], {
      env: {
        ...process.env,
        AGENTS_COUNCIL_MEMBERS: "kimi",
        // A2: this exit-code proof deliberately uses a one-member roster; opt into the
        // solo quorum so the run reaches the ratify/exit-code path instead of throwing.
        AGENTS_COUNCIL_ALLOW_SOLO: "1",
        OPENROUTER_API_KEY: "test-key",
        AGENTS_COUNCIL_OPENROUTER_URL: server.url.toString(),
        AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS: "5000",
        AGENTS_COUNCIL_MAX_ROUNDS: "1",
      },
      stdout: "ignore",
      stderr: "ignore",
    });
    return await proc.exited;
  } finally {
    server.stop(true);
  }
}

describe("WU-B4 CLI exit code keys off the blocked outcome", () => {
  test("a blocked council run exits non-zero", async () => {
    // ratify (call 3) blocks with an absolute FACTUAL_ERROR veto → outcome blocked.
    const exitCode = await runCliWithCannedReplies([
      "Initial independent answer.",
      "Critique.\nCANDIDATE_CONSENSUS:\nThe registry has exactly five backends.",
      "CONSENSUS: BLOCK\nBLOCK_KIND: FACTUAL_ERROR\nThe source lists nine backends, not five.",
    ]);
    expect(exitCode).not.toBe(0);
  }, 30000);

  test("a ratified council run exits zero", async () => {
    // ratify (call 3) accepts → outcome ratified.
    const exitCode = await runCliWithCannedReplies([
      "Initial independent answer.",
      "Critique.\nCANDIDATE_CONSENSUS:\nThe registry has exactly five backends.",
      "CONSENSUS: ACCEPT\nMatches the source.",
    ]);
    expect(exitCode).toBe(0);
  }, 30000);
});

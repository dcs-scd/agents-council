import { describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  buildCandidateConsensus,
  buildConsensusResult,
  buildDeliberationMessages,
  buildDefaultMembers,
  buildProposalMessages,
  buildRatificationMessages,
  buildSynthesisMessages,
  flattenMessageContent,
  formatModelCouncilMarkdown,
  isConverged,
  parseConsensusSignal,
  parseRatificationAccepted,
  parseRatificationVote,
  resolveOpenRouterTimeoutMs,
  runModelCouncil,
  saveModelCouncilFailure,
  shouldAttemptRepair,
  type MemberRef,
  type ModelCouncilCandidateProposal,
  type ModelCouncilMember,
  type ModelCouncilRatification,
  type ModelCouncilResponse,
  type ModelCouncilResult,
  type ModelCouncilRound,
  saveModelCouncilRun,
} from "./modelCouncil";

// Build a ratification fixture from its raw marker text, deriving the structured
// vote exactly as the engine does so the fixtures never drift from the parser.
function ratification(member: MemberRef, content: string): ModelCouncilRatification {
  const vote = parseRatificationVote(content);
  return { member, content, accepted: vote.decision === "accept", vote };
}

const members: ModelCouncilMember[] = [
  {
    id: "kimi",
    name: "Kimi K2.6",
    provider: "openrouter",
    model: "kimi-test",
  },
  {
    id: "deepseek",
    name: "DeepSeek V4 Pro",
    provider: "openrouter",
    model: "deepseek-test",
  },
  {
    id: "chatgpt",
    name: "ChatGPT 5.5 Pro",
    provider: "codex",
    model: "chatgpt-test",
  },
  {
    id: "claude",
    name: "Opus 4.7",
    provider: "claude",
    model: "claude-test",
  },
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
    memberAgreement: 0.42,
  },
  {
    index: 2,
    proposals: candidateProposals,
    candidateConsensus: "Shared candidate",
    changed: false,
    similarityToPrevious: 0.97,
    memberAgreement: 0.81,
  },
];

describe("model council prompt protocol", () => {
  test("default roster is the odd three-member Opus 4.8 + GPT-5.5 + Gemini council", () => {
    const previous = process.env.AGENTS_COUNCIL_MEMBERS;
    delete process.env.AGENTS_COUNCIL_MEMBERS;

    try {
      const members = buildDefaultMembers();
      // Opus is listed first so it chairs synthesis (members[0]).
      expect(members.map((member) => member.id)).toEqual(["claude", "chatgpt", "gemini"]);
      // Odd, >= 3, and heterogeneous across distinct providers (WU-B7).
      expect(members.length % 2).toBe(1);
      expect(members.length).toBeGreaterThanOrEqual(3);
      expect(new Set(members.map((member) => member.provider)).size).toBe(members.length);
      const claude = members.find((member) => member.id === "claude");
      expect(claude?.model).toBe("claude-opus-4-8");
      expect(claude?.name).toBe("Opus 4.8");
      const chatgpt = members.find((member) => member.id === "chatgpt");
      expect(chatgpt?.model).toBe("gpt-5.5");
      const gemini = members.find((member) => member.id === "gemini");
      expect(gemini?.model).toBe("gemini-3.5-flash");
    } finally {
      restoreEnv("AGENTS_COUNCIL_MEMBERS", previous);
    }
  });

  test("explicit AGENTS_COUNCIL_MEMBERS override still yields exactly n=2 for a cheap draft", () => {
    const previous = process.env.AGENTS_COUNCIL_MEMBERS;
    process.env.AGENTS_COUNCIL_MEMBERS = "claude,chatgpt";

    try {
      const members = buildDefaultMembers();
      // Explicit two-member override is honored exactly — the odd>=3 default
      // applies only when AGENTS_COUNCIL_MEMBERS is unset (WU-B7).
      expect(members.map((member) => member.id)).toEqual(["claude", "chatgpt"]);
      expect(members.length).toBe(2);
    } finally {
      restoreEnv("AGENTS_COUNCIL_MEMBERS", previous);
    }
  });

  test("member selection can limit council to OpenRouter reviewers", () => {
    const previous = process.env.AGENTS_COUNCIL_MEMBERS;
    process.env.AGENTS_COUNCIL_MEMBERS = "kimi,deepseek";

    try {
      expect(buildDefaultMembers().map((member) => member.id)).toEqual(["kimi", "deepseek"]);
    } finally {
      if (previous === undefined) {
        delete process.env.AGENTS_COUNCIL_MEMBERS;
      } else {
        process.env.AGENTS_COUNCIL_MEMBERS = previous;
      }
    }
  });

  test("direct vendor key mode routes Kimi and DeepSeek off OpenRouter", () => {
    const previousMembers = process.env.AGENTS_COUNCIL_MEMBERS;
    const previousDirect = process.env.AGENTS_COUNCIL_DIRECT_VENDOR_KEYS;
    const previousKimiModel = process.env.AGENTS_COUNCIL_KIMI_MODEL;
    const previousDeepSeekModel = process.env.AGENTS_COUNCIL_DEEPSEEK_MODEL;
    process.env.AGENTS_COUNCIL_MEMBERS = "kimi,deepseek";
    process.env.AGENTS_COUNCIL_DIRECT_VENDOR_KEYS = "1";
    delete process.env.AGENTS_COUNCIL_KIMI_MODEL;
    delete process.env.AGENTS_COUNCIL_DEEPSEEK_MODEL;

    try {
      const selected = buildDefaultMembers();
      expect(selected.map((member) => [member.id, member.provider, member.model])).toEqual([
        ["kimi", "moonshot", "kimi-k2.6"],
        ["deepseek", "deepseek", "deepseek-v4-pro"],
      ]);
    } finally {
      restoreEnv("AGENTS_COUNCIL_MEMBERS", previousMembers);
      restoreEnv("AGENTS_COUNCIL_DIRECT_VENDOR_KEYS", previousDirect);
      restoreEnv("AGENTS_COUNCIL_KIMI_MODEL", previousKimiModel);
      restoreEnv("AGENTS_COUNCIL_DEEPSEEK_MODEL", previousDeepSeekModel);
    }
  });

  test("OpenRouter requests time out instead of hanging indefinitely", async () => {
    const server = Bun.serve({
      port: 0,
      fetch: () => new Promise<Response>(() => {}),
    });
    const previousMembers = process.env.AGENTS_COUNCIL_MEMBERS;
    const previousKey = process.env.OPENROUTER_API_KEY;
    const previousUrl = process.env.AGENTS_COUNCIL_OPENROUTER_URL;
    const previousTimeout = process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS;

    process.env.AGENTS_COUNCIL_MEMBERS = "kimi";
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENTS_COUNCIL_OPENROUTER_URL = server.url.toString();
    process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS = "50";

    try {
      expect(resolveOpenRouterTimeoutMs()).toBe(50);
      await expect(runModelCouncil({ prompt: "timeout smoke" })).rejects.toThrow(/timed out after 50ms/);
    } finally {
      server.stop(true);
      restoreEnv("AGENTS_COUNCIL_MEMBERS", previousMembers);
      restoreEnv("OPENROUTER_API_KEY", previousKey);
      restoreEnv("AGENTS_COUNCIL_OPENROUTER_URL", previousUrl);
      restoreEnv("AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS", previousTimeout);
    }
  });

  test("OpenRouter response body read is covered by the same timeout", async () => {
    const server = Bun.serve({
      port: 0,
      fetch: () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode("{"));
            },
          }),
        ),
    });
    const previousMembers = process.env.AGENTS_COUNCIL_MEMBERS;
    const previousKey = process.env.OPENROUTER_API_KEY;
    const previousUrl = process.env.AGENTS_COUNCIL_OPENROUTER_URL;
    const previousTimeout = process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS;

    process.env.AGENTS_COUNCIL_MEMBERS = "kimi";
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENTS_COUNCIL_OPENROUTER_URL = server.url.toString();
    process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS = "50";

    try {
      await expect(runModelCouncil({ prompt: "body timeout smoke" })).rejects.toThrow(/complete response body/);
    } finally {
      server.stop(true);
      restoreEnv("AGENTS_COUNCIL_MEMBERS", previousMembers);
      restoreEnv("OPENROUTER_API_KEY", previousKey);
      restoreEnv("AGENTS_COUNCIL_OPENROUTER_URL", previousUrl);
      restoreEnv("AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS", previousTimeout);
    }
  });

  test("initial proposal prompt stresses objective independent reasoning", () => {
    const messages = buildProposalMessages("Pick an architecture", members[0]!);
    const system = messages[0]?.content ?? "";

    expect(system).toContain("objective accuracy");
    expect(system).toContain("Do not validate the user's premise by default");
    expect(system).toContain("Give your independent answer");
    expect(system).toContain("flag what would change your mind");
  });

  test("deliberation prompt makes agents discuss peer proposals before consensus", () => {
    const round1 = buildDeliberationMessages("Pick an architecture", responses, [], "", members[1]!, 1);
    const r1System = flattenMessageContent(round1[0]?.content ?? "");
    const r1User = flattenMessageContent(round1[1]?.content ?? "");

    expect(r1System).toContain("multi-agent council deliberation");
    expect(r1System).toContain("Challenge weak reasoning");
    expect(r1System).toContain("adopt stronger reasoning from peers");
    expect(r1System).toContain("CANDIDATE_CONSENSUS");
    // Round 1 carries the initial independent proposals.
    expect(r1User).toContain("deliberation round 1");
    expect(r1User).toContain("Initial council proposals");
    expect(r1User).toContain("Kimi K2.6 proposal");

    const round2 = buildDeliberationMessages(
      "Pick an architecture",
      responses,
      candidateProposals,
      "Current candidate",
      members[1]!,
      2,
    );
    const r2User = flattenMessageContent(round2[1]?.content ?? "");

    expect(r2User).toContain("deliberation round 2");
    expect(r2User).toContain("Current candidate");
    expect(r2User).toContain("Latest peer proposed candidate solutions");
    // Token saving (#3): initial proposals are not re-sent from round 2 onward.
    expect(r2User).not.toContain("Initial council proposals");

    // Caching (#1): the static prefix is a cache-marked content part.
    const parts = round2[1]?.content;
    expect(Array.isArray(parts)).toBe(true);
    if (Array.isArray(parts)) {
      expect(parts[0]?.cache_control?.type).toBe("ephemeral");
      expect(parts[0]?.text).toContain("Original request:");
    }
  });

  test("ratification prompt requires peer consensus instead of chair synthesis", () => {
    const messages = buildRatificationMessages("Pick an architecture", rounds, "Shared candidate", members[2]!);
    const system = flattenMessageContent(messages[0]?.content ?? "");
    const user = flattenMessageContent(messages[1]?.content ?? "");

    expect(system).toContain("one peer in a multi-agent consensus council");
    expect(system).toContain("You are not a chair");
    expect(system).toContain("CONSENSUS: ACCEPT");
    expect(system).toContain("CONSENSUS: BLOCK");
    // Ternary vote grammar (F1): ACCEPT_WITH_EDITS is offered as a non-veto, and
    // BLOCK must declare a kind so the engine can tell a repairable objection from
    // an absolute veto.
    expect(system).toContain("CONSENSUS: ACCEPT_WITH_EDITS");
    expect(system).toContain("BLOCK_KIND");
    expect(system).toContain("FACTUAL_ERROR");
    // Token saving (#4): ratifiers see the final peer positions, not the full
    // re-sent deliberation history.
    expect(user).toContain("Final peer positions");
    expect(user).toContain("Candidate consensus artifact to ratify");
    expect(user).toContain("Shared candidate");
    expect(user).not.toContain("Deliberation rounds:");
  });
});

describe("model council consensus repair", () => {
  test("candidate builder nominates the most complete draft when drafts are not identical", () => {
    const shortDraft: ModelCouncilCandidateProposal = {
      member: members[0]!,
      content: "critique",
      candidateConsensus: "Use option A.",
    };
    const longDraft: ModelCouncilCandidateProposal = {
      member: members[1]!,
      content: "critique",
      candidateConsensus: "Use option A, because it minimizes latency and cost across every tier.",
    };

    const built = buildCandidateConsensus([shortDraft, longDraft]);

    // The single most-complete draft is nominated — never the old un-ratifiable stitch.
    expect(built).toBe(longDraft.candidateConsensus);
    expect(built).not.toContain("not yet unified");
    expect(built).not.toContain("Peer candidate drafts");
  });

  test("candidate builder returns the shared draft when every member is byte-identical", () => {
    const draft = "Re-ground each tier's VICOM audit to its real decision surface.";
    const proposals = members.map((member) => ({ member, content: "critique", candidateConsensus: draft }));

    expect(buildCandidateConsensus(proposals)).toBe(draft);
  });

  test("repair is attempted only when ratification ran and at least one member blocked", () => {
    const accept = ratification(members[0]!, "CONSENSUS: ACCEPT");
    const block = ratification(members[1]!, "CONSENSUS: BLOCK\nReplace the 4.6 sentence.");

    expect(shouldAttemptRepair([])).toBe(false);
    expect(shouldAttemptRepair([accept])).toBe(false);
    expect(shouldAttemptRepair([accept, block])).toBe(true);
  });

  test("synthesis prompt folds blocking peers' objections into one revised candidate", () => {
    const ratifications: ModelCouncilRatification[] = [
      ratification(members[0]!, "CONSENSUS: ACCEPT\nNo material change."),
      ratification(members[1]!, "CONSENSUS: BLOCK\nRequired edit: replace the 4.6 sentence."),
    ];

    const messages = buildSynthesisMessages("Review the tiers", "Current artifact text", ratifications, members[2]!);
    const system = flattenMessageContent(messages[0]?.content ?? "");
    const user = flattenMessageContent(messages[1]?.content ?? "");

    expect(system).toContain("CANDIDATE_CONSENSUS");
    expect(system).toContain("incorporates every well-founded required edit");
    expect(user).toContain("Current artifact text");
    // Only the blocking member's objection is carried in — accepting notes are not dragged in.
    expect(user).toContain("replace the 4.6 sentence.");
    expect(user).not.toContain("No material change.");
  });

  test("markdown surfaces the consensus repair cycle when one occurred", () => {
    const result: ModelCouncilResult = {
      prompt: "Review the tiers",
      members,
      responses,
      deliberations: candidateProposals,
      rounds,
      candidateConsensus: "Revised shared candidate",
      converged: true,
      ratifications: members.map((member) => ratification(member, "CONSENSUS: ACCEPT")),
      repair: {
        priorRatifications: [ratification(members[1]!, "CONSENSUS: BLOCK\nFix the 4.6 line.")],
        revisedCandidate: "Revised shared candidate",
        synthesizedBy: members[0]!,
      },
      consensus: {
        reached: true,
        outcome: "ratified",
        ratifiedBy: members.map((member) => member.name),
        blockedBy: [],
      },
    };

    const markdown = formatModelCouncilMarkdown(result);

    expect(markdown).toContain("## Consensus Repair");
    expect(markdown).toContain("Fix the 4.6 line.");
    expect(markdown).toContain("### Revised candidate");
    expect(markdown).toContain("## Peer Ratifications (after repair)");
  });

  test("markdown omits the repair section for an ordinary single-round ratification", () => {
    const result: ModelCouncilResult = {
      prompt: "Review the tiers",
      members,
      responses,
      deliberations: candidateProposals,
      rounds,
      candidateConsensus: "Shared candidate",
      converged: true,
      ratifications: members.map((member) => ratification(member, "CONSENSUS: ACCEPT")),
      consensus: {
        reached: true,
        outcome: "ratified",
        ratifiedBy: members.map((member) => member.name),
        blockedBy: [],
      },
    };

    const markdown = formatModelCouncilMarkdown(result);

    expect(markdown).not.toContain("## Consensus Repair");
    expect(markdown).toContain("## Peer Ratifications");
    expect(markdown).not.toContain("(after repair)");
  });

  test("a blocked candidate with a path-to-accept is repaired into a ratified consensus", async () => {
    // Drive runModelCouncil end-to-end through the mock OpenRouter transport with
    // a single member. Canned replies, in call order: proposal, deliberation
    // (converges round 1), ratify (BLOCK with a required edit), synthesis
    // (revised draft), re-ratify (ACCEPT). The pre-fix engine would have recorded
    // "blocked"; the repair cycle must now reach "ratified".
    const cannedByCall = [
      "Initial independent answer.",
      "Critique.\nCANDIDATE_CONSENSUS:\nDraft v1 recommends option A for every tier.",
      "CONSENSUS: BLOCK\nRequired edit: also state the cost tradeoff before I can accept.",
      "Synthesizing.\nCANDIDATE_CONSENSUS:\nDraft v2 recommends option A for every tier and states the cost tradeoff.",
      "CONSENSUS: ACCEPT\nThe revision addresses my objection.",
    ];
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
    const previousMembers = process.env.AGENTS_COUNCIL_MEMBERS;
    const previousKey = process.env.OPENROUTER_API_KEY;
    const previousUrl = process.env.AGENTS_COUNCIL_OPENROUTER_URL;
    const previousTimeout = process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS;

    process.env.AGENTS_COUNCIL_MEMBERS = "kimi";
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENTS_COUNCIL_OPENROUTER_URL = server.url.toString();
    process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS = "5000";

    try {
      const result = await runModelCouncil({ prompt: "Review the tiers" });

      expect(result.converged).toBe(true);
      expect(result.repair).toBeDefined();
      expect(result.repair?.priorRatifications[0]?.accepted).toBe(false);
      // The decisive candidate/ratifications are the post-repair values.
      expect(result.candidateConsensus).toContain("Draft v2");
      expect(result.candidateConsensus).toContain("cost tradeoff");
      expect(result.ratifications.every((ratification) => ratification.accepted)).toBe(true);
      expect(result.consensus.outcome).toBe("ratified");
      expect(result.consensus.reached).toBe(true);
    } finally {
      server.stop(true);
      restoreEnv("AGENTS_COUNCIL_MEMBERS", previousMembers);
      restoreEnv("OPENROUTER_API_KEY", previousKey);
      restoreEnv("AGENTS_COUNCIL_OPENROUTER_URL", previousUrl);
      restoreEnv("AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS", previousTimeout);
    }
  });
});

describe("model council ratification gate (F2)", () => {
  test("buildConsensusResult reports not_attempted only when ratify never ran", () => {
    expect(buildConsensusResult([], members).outcome).toBe("not_attempted");

    const allAccept = buildConsensusResult(
      [ratification(members[0]!, "CONSENSUS: ACCEPT"), ratification(members[1]!, "CONSENSUS: ACCEPT")],
      members,
    );
    expect(allAccept.outcome).toBe("ratified");
    expect(allAccept.reached).toBe(true);

    const mixed = buildConsensusResult(
      [ratification(members[0]!, "CONSENSUS: ACCEPT"), ratification(members[1]!, "CONSENSUS: BLOCK\nNo.")],
      members,
    );
    expect(mixed.outcome).toBe("blocked");
    expect(mixed.reached).toBe(false);
  });

  test("a non-converged run still ratifies its candidate instead of recording not_attempted", async () => {
    // Two members whose deliberation drafts share zero tokens: none of the three
    // convergence arms fire (changed=true, similarity null on round 1, agreement
    // 0 < 0.80). Pre-F2 the engine left converged=false and never ratified, so the
    // outcome was not_attempted. F2 ratifies the final candidate regardless.
    const cannedByCall = [
      "Initial answer one.",
      "Initial answer two.",
      "Critique.\nCANDIDATE_CONSENSUS:\nAlpha beta gamma delta epsilon zeta.",
      "Critique.\nCANDIDATE_CONSENSUS:\nOmega sigma tau.",
      "CONSENSUS: ACCEPT\nEndorsed.",
      "CONSENSUS: ACCEPT\nEndorsed.",
    ];
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
    const previousMembers = process.env.AGENTS_COUNCIL_MEMBERS;
    const previousKey = process.env.OPENROUTER_API_KEY;
    const previousUrl = process.env.AGENTS_COUNCIL_OPENROUTER_URL;
    const previousTimeout = process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS;
    const previousRounds = process.env.AGENTS_COUNCIL_MAX_ROUNDS;

    process.env.AGENTS_COUNCIL_MEMBERS = "kimi,deepseek";
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENTS_COUNCIL_OPENROUTER_URL = server.url.toString();
    process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS = "5000";
    process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";

    try {
      const result = await runModelCouncil({ prompt: "Pick an option" });

      expect(result.converged).toBe(false);
      expect(result.ratifications.length).toBe(2);
      expect(result.consensus.outcome).toBe("ratified");
      expect(result.consensus.outcome).not.toBe("not_attempted");
    } finally {
      server.stop(true);
      restoreEnv("AGENTS_COUNCIL_MEMBERS", previousMembers);
      restoreEnv("OPENROUTER_API_KEY", previousKey);
      restoreEnv("AGENTS_COUNCIL_OPENROUTER_URL", previousUrl);
      restoreEnv("AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS", previousTimeout);
      restoreEnv("AGENTS_COUNCIL_MAX_ROUNDS", previousRounds);
    }
  });
});

describe("absolute veto closes the false-accept axis (F7)", () => {
  const accept = ratification(members[0]!, "CONSENSUS: ACCEPT");
  const acceptWithEdits = ratification(members[0]!, "CONSENSUS: ACCEPT_WITH_EDITS\nREQUIRED_EDITS: tighten the intro");
  const factualError = ratification(
    members[1]!,
    "CONSENSUS: BLOCK\nBLOCK_KIND: FACTUAL_ERROR\nThe source lists nine backends, not five.",
  );
  const materialDisagreement = ratification(
    members[1]!,
    "CONSENSUS: BLOCK\nBLOCK_KIND: MATERIAL_DISAGREEMENT\nWe disagree on the core tradeoff.",
  );
  const insufficientEvidence = ratification(
    members[1]!,
    "CONSENSUS: BLOCK\nBLOCK_KIND: INSUFFICIENT_EVIDENCE\nNeeds a benchmark before I can accept.",
  );

  test("a FACTUAL_ERROR or MATERIAL_DISAGREEMENT veto skips the repair cycle", () => {
    expect(shouldAttemptRepair([accept, factualError])).toBe(false);
    expect(shouldAttemptRepair([accept, materialDisagreement])).toBe(false);
  });

  test("an absolute veto overrides an ACCEPT_WITH_EDITS that would otherwise repair", () => {
    // ACCEPT_WITH_EDITS alone is repairable; pairing it with a FACTUAL_ERROR must not be.
    expect(shouldAttemptRepair([acceptWithEdits])).toBe(true);
    expect(shouldAttemptRepair([acceptWithEdits, factualError])).toBe(false);
  });

  test("a repairable block kind still triggers the repair cycle", () => {
    expect(shouldAttemptRepair([accept, insufficientEvidence])).toBe(true);
  });

  test("buildConsensusResult names an absolute veto in the reason, but not a repairable block", () => {
    const vetoed = buildConsensusResult([accept, factualError], members);
    expect(vetoed.outcome).toBe("blocked");
    expect(vetoed.notRatifiedReason).toContain("FACTUAL_ERROR");

    const repairable = buildConsensusResult([accept, insufficientEvidence], members);
    expect(repairable.outcome).toBe("blocked");
    expect(repairable.notRatifiedReason).toBeUndefined();
  });

  test("the ratification prompt instructs verification against the source and explains the veto", () => {
    const messages = buildRatificationMessages("Original request", rounds, "Candidate artifact.", members[0]!);
    const system = flattenMessageContent(messages[0]?.content ?? "");
    expect(system).toContain("absolute veto");
    expect(system).toContain("source");
  });

  test("a FACTUAL_ERROR block yields blocked and is NOT repaired into ratified", async () => {
    // Canned replies cover propose(0,1) → deliberate(2,3) → ratify(4,5). Entries 6-8
    // are a synthesis + re-ratify that WOULD flip the outcome to ratified — they must
    // never be consumed, because the FACTUAL_ERROR veto skips repair entirely.
    const cannedByCall = [
      "Initial answer A.",
      "Initial answer B.",
      "Critique.\nCANDIDATE_CONSENSUS:\nThe registry has exactly five backends.",
      "Critique.\nCANDIDATE_CONSENSUS:\nThe registry has exactly five backends.",
      "CONSENSUS: ACCEPT\nMatches the source.",
      "CONSENSUS: BLOCK\nBLOCK_KIND: FACTUAL_ERROR\nThe source lists nine backends, not five.",
      "CANDIDATE_CONSENSUS:\nThe registry has nine backends.",
      "CONSENSUS: ACCEPT\nFixed now.",
      "CONSENSUS: ACCEPT\nFixed now.",
    ];
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
    const previousMembers = process.env.AGENTS_COUNCIL_MEMBERS;
    const previousKey = process.env.OPENROUTER_API_KEY;
    const previousUrl = process.env.AGENTS_COUNCIL_OPENROUTER_URL;
    const previousTimeout = process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS;
    const previousRounds = process.env.AGENTS_COUNCIL_MAX_ROUNDS;

    process.env.AGENTS_COUNCIL_MEMBERS = "kimi,deepseek";
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENTS_COUNCIL_OPENROUTER_URL = server.url.toString();
    process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS = "5000";
    process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";

    try {
      const result = await runModelCouncil({ prompt: "How many backends does the registry have?" });

      expect(result.consensus.outcome).toBe("blocked");
      expect(result.repair).toBeUndefined();
      expect(result.consensus.notRatifiedReason).toContain("FACTUAL_ERROR");
      // Synthesis (call 6) and re-ratify (7,8) were never dispatched — repair skipped.
      expect(callIndex).toBe(6);
    } finally {
      server.stop(true);
      restoreEnv("AGENTS_COUNCIL_MEMBERS", previousMembers);
      restoreEnv("OPENROUTER_API_KEY", previousKey);
      restoreEnv("AGENTS_COUNCIL_OPENROUTER_URL", previousUrl);
      restoreEnv("AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS", previousTimeout);
      restoreEnv("AGENTS_COUNCIL_MAX_ROUNDS", previousRounds);
    }
  });
});

describe("consensus signal parsing (F3)", () => {
  test("CONVERGED with no material disagreements parses as converged", () => {
    const signal = parseConsensusSignal(
      "Looks aligned.\nCONSENSUS_STATUS: CONVERGED\nMATERIAL_DISAGREEMENTS: NONE\nCANDIDATE_CONSENSUS:\nUse option A.",
    );
    expect(signal.status).toBe("converged");
    expect(signal.hasMaterialDisagreements).toBe(false);
  });

  test("DIVERGED with a listed disagreement parses as diverged and captures the list", () => {
    const signal = parseConsensusSignal(
      "CONSENSUS_STATUS: DIVERGED\nMATERIAL_DISAGREEMENTS: tier-3 routing, cost model\nCANDIDATE_CONSENSUS:\nUse option A.",
    );
    expect(signal.status).toBe("diverged");
    expect(signal.hasMaterialDisagreements).toBe(true);
    expect(signal.disagreements).toBe("tier-3 routing, cost model");
  });

  test("CONVERGED but with a listed disagreement still flags the disagreement", () => {
    // Contradictory self-report — the listed disagreement wins, so isConverged
    // treats it as unresolved rather than trusting the bare CONVERGED token.
    const signal = parseConsensusSignal(
      "CONSENSUS_STATUS: CONVERGED\nMATERIAL_DISAGREEMENTS: unresolved latency budget",
    );
    expect(signal.status).toBe("converged");
    expect(signal.hasMaterialDisagreements).toBe(true);
  });

  test("a decorated (blockquoted / bulleted) marker still parses", () => {
    const signal = parseConsensusSignal("> CONSENSUS_STATUS: CONVERGED\n- MATERIAL_DISAGREEMENTS: NONE");
    expect(signal.status).toBe("converged");
    expect(signal.hasMaterialDisagreements).toBe(false);
  });

  test("missing markers parse as unknown status with no disagreement", () => {
    const signal = parseConsensusSignal("Critique.\nCANDIDATE_CONSENSUS:\nUse option A.");
    expect(signal.status).toBe("unknown");
    expect(signal.hasMaterialDisagreements).toBe(false);
    expect(signal.disagreements).toBe("");
  });

  test("a disagreement listed without a status line still flags divergence", () => {
    const signal = parseConsensusSignal("MATERIAL_DISAGREEMENTS: the cost model is wrong");
    expect(signal.status).toBe("unknown");
    expect(signal.hasMaterialDisagreements).toBe(true);
  });
});

describe("convergence signal drives early-stop (F3)", () => {
  // Post-F2 isConverged only controls early-stop (whether the deliberation loop
  // breaks before maxRounds); it no longer gates whether ratification runs. These
  // tests pin the new arm ordering: structured self-report is primary, draft
  // overlap coefficient is the fallback, and the demoted Jaccard memberAgreement
  // is no longer consulted (we set it low in every fixture to prove that).
  function round(contents: string[], overrides: Partial<ModelCouncilRound> = {}): ModelCouncilRound {
    const marker = "CANDIDATE_CONSENSUS:";
    const proposals: ModelCouncilCandidateProposal[] = contents.map((content, index) => {
      const at = content.toUpperCase().indexOf(marker);
      const candidate = at < 0 ? content.trim() : content.slice(at + marker.length).trim();
      return { member: members[index % members.length]!, content, candidateConsensus: candidate };
    });
    return {
      index: 1,
      proposals,
      candidateConsensus: buildCandidateConsensus(proposals),
      changed: true,
      similarityToPrevious: null,
      memberAgreement: 0, // demoted Jaccard arm pinned low — must not influence the result
      ...overrides,
    };
  }

  test("members self-reporting CONVERGED converge despite near-zero token overlap", () => {
    // Candidate drafts share zero tokens, so neither lexical arm (round-to-round
    // similarity, draft overlap) can fire — only the structured self-report can.
    const r = round([
      "CONSENSUS_STATUS: CONVERGED\nMATERIAL_DISAGREEMENTS: NONE\nCANDIDATE_CONSENSUS:\nAlpha beta gamma.",
      "CONSENSUS_STATUS: CONVERGED\nMATERIAL_DISAGREEMENTS: NONE\nCANDIDATE_CONSENSUS:\nOmega sigma tau.",
    ]);
    expect(isConverged(r)).toBe(true);
  });

  test("draft overlap coefficient is the fallback, and fires where Jaccard would not", () => {
    // Short draft fully contained in a much longer one: overlap coefficient = 1.0
    // (>= 0.80) but Jaccard ~0.13 (< 0.80). No markers, so the structured arm is
    // silent and the fallback decides. The old memberAgreement (Jaccard) arm would
    // have left this unconverged.
    const r = round([
      "CANDIDATE_CONSENSUS:\nUse A.",
      "CANDIDATE_CONSENSUS:\nUse A because it minimizes latency cost energy and complexity across every tier and workload.",
    ]);
    expect(isConverged(r)).toBe(true);
  });

  test("markerless drafts with genuinely low overlap do not converge", () => {
    const r = round(["CANDIDATE_CONSENSUS:\nAlpha beta gamma.", "CANDIDATE_CONSENSUS:\nOmega sigma tau."]);
    expect(isConverged(r)).toBe(false);
  });

  test("an explicit DIVERGED report suppresses convergence even when drafts coincide", () => {
    // Identical candidate text (overlap 1.0) but one member still reports DIVERGED:
    // explicit disagreement beats lexical coincidence.
    const candidate = "CANDIDATE_CONSENSUS:\nUse option A across all tiers.";
    const r = round([
      `CONSENSUS_STATUS: DIVERGED\nMATERIAL_DISAGREEMENTS: tier-3 routing\n${candidate}`,
      `CONSENSUS_STATUS: CONVERGED\nMATERIAL_DISAGREEMENTS: NONE\n${candidate}`,
    ]);
    expect(isConverged(r)).toBe(false);
  });

  test("a byte-identical candidate still short-circuits even when a member reports DIVERGED", () => {
    // Arm 1 (candidate frozen between rounds) is ratify-ready; any residual
    // objection surfaces as a BLOCK at ratification, not here.
    const r = round(
      [
        "CONSENSUS_STATUS: DIVERGED\nMATERIAL_DISAGREEMENTS: tier-3 routing\nCANDIDATE_CONSENSUS:\nUse option A.",
        "CONSENSUS_STATUS: DIVERGED\nMATERIAL_DISAGREEMENTS: tier-3 routing\nCANDIDATE_CONSENSUS:\nUse option A.",
      ],
      { changed: false },
    );
    expect(isConverged(r)).toBe(true);
  });

  test("a near-identical candidate between rounds still converges via the similarity arm", () => {
    const r = round(["CANDIDATE_CONSENSUS:\nAlpha beta gamma.", "CANDIDATE_CONSENSUS:\nOmega sigma tau."], {
      similarityToPrevious: 0.97,
    });
    expect(isConverged(r)).toBe(true);
  });
});

describe("model council persistence", () => {
  test("saveModelCouncilRun writes the full transcript under the deliberations directory", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "council-run-"));
    const previous = process.env.AGENTS_COUNCIL_DELIBERATIONS_DIR;
    process.env.AGENTS_COUNCIL_DELIBERATIONS_DIR = dir;

    try {
      const result: ModelCouncilResult = {
        prompt: "Pick an architecture",
        members,
        responses,
        deliberations: candidateProposals,
        rounds,
        candidateConsensus: "Shared candidate",
        converged: true,
        ratifications: [],
        consensus: {
          reached: true,
          outcome: "ratified",
          ratifiedBy: members.map((member) => member.name),
          blockedBy: [],
        },
      };

      const { jsonPath, markdownPath } = await saveModelCouncilRun(result);

      expect(jsonPath.startsWith(dir)).toBe(true);
      expect(jsonPath.endsWith(".json")).toBe(true);
      expect(markdownPath.startsWith(dir)).toBe(true);
      expect(markdownPath.endsWith(".md")).toBe(true);

      const written = JSON.parse(await readFile(jsonPath, "utf8"));
      expect(written.prompt).toBe("Pick an architecture");
      expect(written.members).toHaveLength(members.length);
      expect(written.rounds).toHaveLength(rounds.length);

      const markdown = await readFile(markdownPath, "utf8");
      expect(markdown).toContain("# Council Consensus");
      expect(markdown).toContain("## Consensus Answer");
      expect(markdown).toContain("Pick an architecture");
      expect(markdown).toContain("Shared candidate");
      // Convergence trajectory is surfaced so progress is legible at a glance.
      expect(markdown).toContain("## Convergence");
      expect(markdown).toContain("Member agreement rose from 0.420 to 0.810");
      expect(markdown).toContain("| Round | Changed | Shared vs prev | Member agreement |");
    } finally {
      if (previous === undefined) {
        delete process.env.AGENTS_COUNCIL_DELIBERATIONS_DIR;
      } else {
        process.env.AGENTS_COUNCIL_DELIBERATIONS_DIR = previous;
      }
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("saveModelCouncilFailure writes a transcript when the council aborts before consensus", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "council-failed-"));
    const previousDir = process.env.AGENTS_COUNCIL_DELIBERATIONS_DIR;
    const previousMembers = process.env.AGENTS_COUNCIL_MEMBERS;
    process.env.AGENTS_COUNCIL_DELIBERATIONS_DIR = dir;
    process.env.AGENTS_COUNCIL_MEMBERS = "kimi,deepseek";

    try {
      const { jsonPath, markdownPath } = await saveModelCouncilFailure({
        prompt: "Review WU-008",
        error: "Kimi K2.6 OpenRouter request failed after 3 attempts: timed out after 50ms",
      });

      const written = JSON.parse(await readFile(jsonPath, "utf8"));
      expect(written.schema_version).toBe("agents-council.model_council_failure.v1");
      expect(written.error).toContain("timed out after 50ms");
      expect(written.members.map((member: ModelCouncilMember) => member.id)).toEqual(["kimi", "deepseek"]);

      const markdown = await readFile(markdownPath, "utf8");
      expect(markdown).toContain("# Council Failed");
      expect(markdown).toContain("not a consensus result");
      expect(markdown).toContain("Review WU-008");
    } finally {
      restoreEnv("AGENTS_COUNCIL_DELIBERATIONS_DIR", previousDir);
      restoreEnv("AGENTS_COUNCIL_MEMBERS", previousMembers);
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("ratification marker parsing", () => {
  test("bare ACCEPT / BLOCK markers parse as written", () => {
    expect(parseRatificationAccepted("CONSENSUS: ACCEPT\nLooks good.")).toBe(true);
    expect(parseRatificationAccepted("CONSENSUS: BLOCK\nNeeds work.")).toBe(false);
  });

  test("a bolded or decorated ACCEPT marker is not silently miscounted as a block", () => {
    // Pre-fix, any first non-empty line that was not a literal `CONSENSUS: ACCEPT`
    // parsed as BLOCK — so a member that merely bolded the marker vetoed by accident.
    expect(parseRatificationAccepted("**CONSENSUS: ACCEPT**")).toBe(true);
    expect(parseRatificationAccepted("> CONSENSUS: ACCEPT")).toBe(true);
    expect(parseRatificationAccepted("`CONSENSUS: ACCEPT`")).toBe(true);
    expect(parseRatificationAccepted("# CONSENSUS: ACCEPT")).toBe(true);
    expect(parseRatificationAccepted("- CONSENSUS: ACCEPT")).toBe(true);
  });

  test("a short preamble before the marker does not flip ACCEPT to a block", () => {
    expect(parseRatificationAccepted("After review of the artifact:\nCONSENSUS: ACCEPT")).toBe(true);
  });

  test("a decorated BLOCK marker still blocks", () => {
    expect(parseRatificationAccepted("**CONSENSUS: BLOCK**\nMaterial objection remains.")).toBe(false);
  });

  test("a response with no marker defaults to non-accept", () => {
    expect(parseRatificationAccepted("I think this is fine overall.")).toBe(false);
    expect(parseRatificationAccepted("")).toBe(false);
  });
});

describe("ratification vote parsing (ternary)", () => {
  test("ACCEPT parses as a clean accept", () => {
    expect(parseRatificationVote("CONSENSUS: ACCEPT\nLooks good.").decision).toBe("accept");
  });

  test("ACCEPT_WITH_EDITS is its own decision, not an ACCEPT and not a veto", () => {
    const vote = parseRatificationVote("CONSENSUS: ACCEPT_WITH_EDITS\nREQUIRED_EDITS: drop the 4.6 claim.");
    expect(vote.decision).toBe("accept_with_edits");
    expect(vote.requiredEdits).toBe("drop the 4.6 claim.");
    // The longer token wins over ACCEPT, and the derived boolean routes it to repair.
    expect(parseRatificationAccepted("CONSENSUS: ACCEPT_WITH_EDITS\nREQUIRED_EDITS: x")).toBe(false);
  });

  test("REQUIRED_EDITS captures a multi-line block", () => {
    const vote = parseRatificationVote("CONSENSUS: ACCEPT_WITH_EDITS\nREQUIRED_EDITS:\n- fix A\n- fix B");
    expect(vote.requiredEdits).toContain("fix A");
    expect(vote.requiredEdits).toContain("fix B");
  });

  test("BLOCK carries its declared kind", () => {
    const vote = parseRatificationVote(
      "CONSENSUS: BLOCK\nBLOCK_KIND: FACTUAL_ERROR\nThe artifact misstates the count.",
    );
    expect(vote.decision).toBe("block");
    expect(vote.blockKind).toBe("FACTUAL_ERROR");
  });

  test("a bare BLOCK with no kind leaves blockKind undefined", () => {
    const vote = parseRatificationVote("CONSENSUS: BLOCK\nNot convinced.");
    expect(vote.decision).toBe("block");
    expect(vote.blockKind).toBeUndefined();
  });

  test("a decorated BLOCK_KIND line is still read", () => {
    const vote = parseRatificationVote("> CONSENSUS: BLOCK\n> **BLOCK_KIND: MATERIAL_DISAGREEMENT**");
    expect(vote.blockKind).toBe("MATERIAL_DISAGREEMENT");
  });

  test("a markerless response is a PROTOCOL block, not a substantive veto", () => {
    const vote = parseRatificationVote("I think this is fine overall.");
    expect(vote.decision).toBe("block");
    expect(vote.blockKind).toBe("PROTOCOL");
  });
});

describe("model council outcome rendering", () => {
  const base = {
    prompt: "Evaluate the engine",
    members,
    responses,
    deliberations: candidateProposals,
    rounds,
  };

  test("a not_attempted outcome renders as 'Not Reached', not 'Blocked'", () => {
    const result: ModelCouncilResult = {
      ...base,
      candidateConsensus: "Longest draft; convergence never fired.",
      converged: false,
      ratifications: [],
      consensus: {
        reached: false,
        outcome: "not_attempted",
        ratifiedBy: [],
        blockedBy: [],
        notRatifiedReason: "no candidate consensus emerged before max rounds",
      },
    };

    const markdown = formatModelCouncilMarkdown(result);

    expect(markdown).toContain("# Council Consensus Not Reached");
    expect(markdown).not.toContain("# Council Consensus Blocked");
    expect(markdown).toContain("Outcome: not_attempted");
  });

  test("a blocked outcome still renders as 'Blocked'", () => {
    const result: ModelCouncilResult = {
      ...base,
      candidateConsensus: "Ratified candidate that one member vetoed.",
      converged: true,
      ratifications: [
        ratification(members[3]!, "CONSENSUS: ACCEPT"),
        ratification(members[2]!, "CONSENSUS: BLOCK\nMaterial objection."),
      ],
      consensus: {
        reached: false,
        outcome: "blocked",
        ratifiedBy: [members[3]!.name],
        blockedBy: [members[2]!.name],
      },
    };

    const markdown = formatModelCouncilMarkdown(result);

    expect(markdown).toContain("# Council Consensus Blocked");
    expect(markdown).toContain("Outcome: blocked");
  });

  test("a ratified outcome renders as plain 'Council Consensus'", () => {
    const result: ModelCouncilResult = {
      ...base,
      candidateConsensus: "Shared candidate",
      converged: true,
      ratifications: members.map((member) => ratification(member, "CONSENSUS: ACCEPT")),
      consensus: {
        reached: true,
        outcome: "ratified",
        ratifiedBy: members.map((member) => member.name),
        blockedBy: [],
      },
    };

    const markdown = formatModelCouncilMarkdown(result);

    expect(markdown).toContain("# Council Consensus\n");
    expect(markdown).not.toContain("# Council Consensus Blocked");
    expect(markdown).not.toContain("# Council Consensus Not Reached");
  });
});

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

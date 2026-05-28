import { describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  buildDeliberationMessages,
  buildDefaultMembers,
  buildProposalMessages,
  buildRatificationMessages,
  flattenMessageContent,
  resolveOpenRouterTimeoutMs,
  runModelCouncil,
  saveModelCouncilFailure,
  type ModelCouncilCandidateProposal,
  type ModelCouncilMember,
  type ModelCouncilResponse,
  type ModelCouncilResult,
  type ModelCouncilRound,
  saveModelCouncilRun,
} from "./modelCouncil";

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
    expect(system).toContain("material disagreement remains");
    // Token saving (#4): ratifiers see the final peer positions, not the full
    // re-sent deliberation history.
    expect(user).toContain("Final peer positions");
    expect(user).toContain("Candidate consensus artifact to ratify");
    expect(user).toContain("Shared candidate");
    expect(user).not.toContain("Deliberation rounds:");
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

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

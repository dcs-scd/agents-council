import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { Codex } from "@openai/codex-sdk";
import { query } from "@anthropic-ai/claude-agent-sdk";

import { getClaudeCodeExecutablePath, getCodexExecutablePath } from "./council/summon";
import { OBJECTIVE_CONSENSUS_DIRECTIVE } from "./council/objectiveConsensusPrompt";
import { resolveDeliberationsDir } from "../state/path";

const OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_KIMI_MODEL = "moonshotai/kimi-k2.6";
const DEFAULT_DEEPSEEK_MODEL = "deepseek/deepseek-v4-pro";
const DEFAULT_GEMINI_MODEL = "google/gemini-3.5-flash";
const DEFAULT_CHATGPT_MODEL = "gpt-5.5";
const DEFAULT_CHATGPT_REASONING_EFFORT = "xhigh" as const;
const DEFAULT_CLAUDE_MODEL = "claude-opus-4-7";
// Maximum deliberation rounds before the council stops looping. Overridable via
// AGENTS_COUNCIL_MAX_ROUNDS. Raised from 4 to 6 because runs were hitting the cap
// while still actively converging (see the convergence trajectory in the result).
const DEFAULT_MAX_CONSENSUS_ROUNDS = 6;
// Near-convergence threshold: when a round's shared candidate is at least this
// token-similar to the previous round's, treat it as converged and proceed to
// ratification instead of looping until the drafts are byte-identical (which
// verbose models effectively never reach).
const DEFAULT_CONVERGENCE_SIMILARITY_THRESHOLD = 0.95;

export type ModelCouncilMember = {
  id: "kimi" | "deepseek" | "gemini" | "chatgpt" | "claude";
  name: string;
  provider: "openrouter" | "codex" | "claude";
  model: string;
};

export type ModelCouncilResponse = {
  member: ModelCouncilMember;
  content: string;
};

export type ModelCouncilCandidateProposal = ModelCouncilResponse & {
  candidateConsensus: string;
};

export type ModelCouncilRound = {
  index: number;
  proposals: ModelCouncilCandidateProposal[];
  candidateConsensus: string;
  changed: boolean;
  // Convergence trajectory metrics (token-set Jaccard, range 0..1).
  // similarityToPrevious is null for the first round (no prior candidate).
  similarityToPrevious: number | null;
  // Average pairwise similarity of the members' own candidate drafts this round
  // — rises as the members move toward agreement.
  memberAgreement: number;
};

export type ModelCouncilRatification = ModelCouncilResponse & {
  accepted: boolean;
};

export type ModelCouncilConsensus = {
  reached: boolean;
  ratifiedBy: string[];
  blockedBy: string[];
};

export type ModelCouncilResult = {
  prompt: string;
  members: ModelCouncilMember[];
  responses: ModelCouncilResponse[];
  deliberations: ModelCouncilCandidateProposal[];
  rounds: ModelCouncilRound[];
  candidateConsensus: string;
  converged: boolean;
  ratifications: ModelCouncilRatification[];
  consensus: ModelCouncilConsensus;
};

export type RunModelCouncilInput = {
  prompt: string;
};

// A content part lets us mark a stable prefix with cache_control so OpenRouter
// (and the providers that honor it) can cache it across deliberation rounds
// instead of re-billing the full prompt every round.
export type ChatContentPart = {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | ChatContentPart[];
};

// Collapse a message's content to plain text for the non-OpenRouter providers
// (Codex, Claude) which receive a single flattened prompt string.
export function flattenMessageContent(content: string | ChatContentPart[]): string {
  return typeof content === "string" ? content : content.map((part) => part.text).join("");
}

type OpenRouterContentPart = {
  type?: string;
  text?: unknown;
};

type OpenRouterChoice = {
  message?: {
    // content may be a plain string, an array of content parts, or absent when
    // the model only emitted reasoning tokens.
    content?: unknown;
    reasoning?: unknown;
  };
  finish_reason?: string;
  error?: {
    message?: string;
  };
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
  error?: {
    message?: string;
  };
};

// Extract a usable text reply from one OpenRouter choice, tolerating the
// provider variations seen in practice: content as a string, content as an
// array of {type,text} parts, or a reasoning-only response with empty content.
function extractOpenRouterText(choice: OpenRouterChoice | undefined): string | null {
  const message = choice?.message;
  if (!message) {
    return null;
  }

  const { content } = message;
  if (typeof content === "string" && content.trim().length > 0) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const joined = (content as OpenRouterContentPart[])
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
      .trim();
    if (joined.length > 0) {
      return joined;
    }
  }

  const { reasoning } = message;
  if (typeof reasoning === "string" && reasoning.trim().length > 0) {
    return reasoning.trim();
  }

  return null;
}

export async function runModelCouncil(input: RunModelCouncilInput): Promise<ModelCouncilResult> {
  const prompt = normalizeRequiredString(input.prompt, "prompt");
  const members = buildDefaultMembers();
  validateCouncilConfig(members);

  const responses = await Promise.all(
    members.map(async (member) => ({
      member,
      content: await askMember(member, buildProposalMessages(prompt, member)),
    })),
  );

  const rounds: ModelCouncilRound[] = [];
  let candidateConsensus = "";
  let previousProposals: ModelCouncilCandidateProposal[] = [];
  const maxRounds = resolveMaxRounds();

  for (let index = 1; index <= maxRounds; index++) {
    const proposals = await Promise.all(
      members.map(async (member) => {
        const content = await askMember(
          member,
          buildDeliberationMessages(prompt, responses, previousProposals, candidateConsensus, member, index),
        );
        return {
          member,
          content,
          candidateConsensus: parseCandidateConsensus(content),
        };
      }),
    );
    const nextCandidateConsensus = buildCandidateConsensus(proposals);
    const changed = candidateChanged(candidateConsensus, nextCandidateConsensus);
    const similarityToPrevious = index === 1 ? null : tokenSimilarity(candidateConsensus, nextCandidateConsensus);
    const memberAgreement = averagePairwiseSimilarity(
      proposals.map((proposal) => proposal.candidateConsensus || proposal.content),
    );
    const round: ModelCouncilRound = {
      index,
      proposals,
      candidateConsensus: nextCandidateConsensus,
      changed,
      similarityToPrevious,
      memberAgreement,
    };
    rounds.push(round);
    candidateConsensus = nextCandidateConsensus;
    previousProposals = proposals;
    if (isConverged(round) && candidateConsensus.trim().length > 0) {
      break;
    }
  }

  const finalRound = rounds.at(-1);
  const deliberations = finalRound?.proposals ?? [];
  const converged = Boolean(finalRound && isConverged(finalRound) && candidateConsensus.trim().length > 0);

  const ratifications = converged
    ? await Promise.all(
        members.map(async (member) => {
          const content = await askMember(
            member,
            buildRatificationMessages(prompt, rounds, candidateConsensus, member),
          );
          return {
            member,
            content,
            accepted: parseRatificationAccepted(content),
          };
        }),
      )
    : [];

  return {
    prompt,
    members,
    responses,
    deliberations,
    rounds,
    candidateConsensus,
    converged,
    ratifications,
    consensus: buildConsensusResult(ratifications, members, converged),
  };
}

// Format a convergence metric, tolerating transcripts written before these
// metrics existed (renders an em dash when the value is absent).
function formatMetric(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(3) : "—";
}

// One-line, human-readable summary of whether the members moved toward each
// other over the deliberation — the quickest way to tell if progress was made.
function formatConvergenceTrend(rounds: ModelCouncilRound[]): string {
  if (rounds.length === 0) {
    return "No deliberation rounds were recorded.";
  }
  const last = rounds.at(-1)!;
  if (rounds.length === 1) {
    return `Member agreement after 1 round: ${formatMetric(last.memberAgreement)} (token-set Jaccard, 0..1).`;
  }
  const first = rounds[0]!;
  if (!Number.isFinite(first.memberAgreement) || !Number.isFinite(last.memberAgreement)) {
    return "Convergence metrics were not recorded for this run (older transcript).";
  }
  const direction =
    last.memberAgreement > first.memberAgreement
      ? "rose"
      : last.memberAgreement < first.memberAgreement
        ? "fell"
        : "held";
  return [
    `Member agreement ${direction} from ${first.memberAgreement.toFixed(3)} to ${last.memberAgreement.toFixed(3)}`,
    `across ${rounds.length} rounds (token-set Jaccard, 0..1; higher = members closer to agreement).`,
  ].join(" ");
}

// Render a council result as a human-readable Markdown document: the question,
// the consensus answer, the process summary, and the full transcript (initial
// proposals, deliberation rounds, and peer ratifications). This is the single
// canonical Markdown renderer, shared by the CLI output and the saved record.
export function formatModelCouncilMarkdown(result: ModelCouncilResult): string {
  const lines: string[] = [
    result.consensus.reached ? "# Council Consensus" : "# Council Consensus Blocked",
    "",
    `_Generated ${new Date().toISOString()}_`,
    "",
    result.consensus.reached
      ? "Consensus reached by unanimous peer ratification. No single agent decided the result."
      : "Consensus was not reached. No single agent decided the result.",
    "",
    "## Question",
    "",
    result.prompt || "(none)",
    "",
    "## Consensus Answer",
    "",
    result.candidateConsensus || "(none)",
    "",
    "## Process",
    "",
    `- Initial proposals: ${result.responses.length}`,
    `- Deliberation rounds: ${result.rounds.length}`,
    `- Candidate converged: ${result.converged ? "yes" : "no"}`,
    `- Peer ratifications: ${result.ratifications.length}`,
    `- Accepted by: ${result.consensus.ratifiedBy.join(", ") || "none"}`,
    `- Blocked by: ${result.consensus.blockedBy.join(", ") || "none"}`,
    "",
    "## Convergence",
    "",
    formatConvergenceTrend(result.rounds),
    "",
    "| Round | Changed | Shared vs prev | Member agreement |",
    "| ----- | ------- | -------------- | ---------------- |",
    ...result.rounds.map(
      (round) =>
        `| ${round.index} | ${round.changed ? "yes" : "no"} | ${formatMetric(round.similarityToPrevious)} | ${formatMetric(round.memberAgreement)} |`,
    ),
    "",
    "## Members",
    "",
    ...result.members.map((member) => `- **${member.name}** — \`${member.model}\` (${member.provider})`),
    "",
    "## Initial Proposals",
    ...result.responses.flatMap((response) => ["", `### ${response.member.name}`, "", response.content]),
  ];

  for (const round of result.rounds) {
    lines.push("", `## Deliberation Round ${round.index}${round.changed ? "" : " (no change)"}`);
    for (const proposal of round.proposals) {
      lines.push("", `### ${proposal.member.name}`, "", proposal.content);
    }
  }

  lines.push("", "## Peer Ratifications");
  if (result.ratifications.length > 0) {
    for (const ratification of result.ratifications) {
      const verdict = ratification.accepted ? "ACCEPT" : "BLOCK";
      lines.push("", `### ${ratification.member.name} — ${verdict}`, "", ratification.content);
    }
  } else {
    lines.push("", "Ratification skipped because the candidate consensus did not converge.");
  }

  lines.push("");
  return lines.join("\n");
}

// Persist the full deliberation as both a machine-readable JSON transcript and a
// human-readable Markdown document (same basename) so a CLI/MCP run leaves a
// durable record. Returns both absolute paths. The autonomous council is
// otherwise in-memory only (it does not touch the council state store).
export async function saveModelCouncilRun(
  result: ModelCouncilResult,
): Promise<{ jsonPath: string; markdownPath: string }> {
  const deliberationsDir = resolveDeliberationsDir();
  await mkdir(deliberationsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = path.join(deliberationsDir, `council-${timestamp}.json`);
  const markdownPath = path.join(deliberationsDir, `council-${timestamp}.md`);
  await writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  await writeFile(markdownPath, formatModelCouncilMarkdown(result), "utf8");
  return { jsonPath, markdownPath };
}

function validateCouncilConfig(members: ModelCouncilMember[]): void {
  if (members.some((member) => member.provider === "openrouter") && !readEnv("OPENROUTER_API_KEY")) {
    throw new Error("OPENROUTER_API_KEY is required for Kimi and DeepSeek council members.");
  }
}

export function buildDefaultMembers(): ModelCouncilMember[] {
  return [
    {
      id: "kimi",
      name: "Kimi 2.6",
      provider: "openrouter",
      model: readEnv("AGENTS_COUNCIL_KIMI_MODEL") ?? DEFAULT_KIMI_MODEL,
    },
    {
      id: "deepseek",
      name: "DeepSeek V4 Pro",
      provider: "openrouter",
      model: readEnv("AGENTS_COUNCIL_DEEPSEEK_MODEL") ?? DEFAULT_DEEPSEEK_MODEL,
    },
    {
      id: "gemini",
      name: "Gemini 3.5 Flash",
      provider: "openrouter",
      model: readEnv("AGENTS_COUNCIL_GEMINI_MODEL") ?? DEFAULT_GEMINI_MODEL,
    },
    {
      id: "chatgpt",
      name: "ChatGPT 5.5",
      provider: "codex",
      model: readEnv("AGENTS_COUNCIL_CHATGPT_MODEL") ?? DEFAULT_CHATGPT_MODEL,
    },
    {
      id: "claude",
      name: "Opus 4.7",
      provider: "claude",
      model: readEnv("AGENTS_COUNCIL_CLAUDE_MODEL") ?? DEFAULT_CLAUDE_MODEL,
    },
  ];
}

async function askMember(member: ModelCouncilMember, messages: ChatMessage[]): Promise<string> {
  if (member.provider === "openrouter") {
    return askOpenRouter(member, messages);
  }
  if (member.provider === "claude") {
    return askClaude(member, messages);
  }
  return askCodex(member, messages);
}

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const OPENROUTER_MAX_ATTEMPTS = 3;

async function askOpenRouter(member: ModelCouncilMember, messages: ChatMessage[]): Promise<string> {
  const apiKey = readEnv("OPENROUTER_API_KEY");
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required for the OpenRouter council members (Kimi, DeepSeek, Gemini).");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Title": "Agents Council",
  };
  const referer = readEnv("OPENROUTER_HTTP_REFERER");
  if (referer) {
    headers["HTTP-Referer"] = referer;
  }
  const requestBody = JSON.stringify({ model: member.model, messages });

  let lastReason = "no content/reasoning returned";
  for (let attempt = 1; attempt <= OPENROUTER_MAX_ATTEMPTS; attempt++) {
    const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers,
      body: requestBody,
    });

    // Read the raw text first so an empty / non-JSON body stays diagnosable.
    const rawText = await response.text();
    let body: OpenRouterResponse | null = null;
    try {
      body = rawText ? (JSON.parse(rawText) as OpenRouterResponse) : null;
    } catch {
      body = null;
    }

    if (!response.ok) {
      const detail = body?.error?.message ?? `${response.status} ${response.statusText}`;
      // Retry transient upstream failures; fail fast on other client errors.
      if ((response.status === 429 || response.status >= 500) && attempt < OPENROUTER_MAX_ATTEMPTS) {
        lastReason = detail;
        await delay(attempt * 500);
        continue;
      }
      throw new Error(`${member.name} OpenRouter request failed: ${detail}`);
    }

    const choice = body?.choices?.[0];
    const text = extractOpenRouterText(choice);
    if (text) {
      return text;
    }

    // 200 with no usable content/reasoning is usually a transient provider
    // hiccup (often an empty body). Retry, then surface the raw payload.
    const finishReason = choice?.finish_reason ? `finish_reason=${choice.finish_reason}` : null;
    const errorDetail = choice?.error?.message ?? body?.error?.message ?? null;
    lastReason = [finishReason, errorDetail].filter(Boolean).join("; ") || "no content/reasoning returned";
    if (attempt < OPENROUTER_MAX_ATTEMPTS) {
      await delay(attempt * 500);
      continue;
    }
    const snippet = (rawText.trim().length > 0 ? rawText : "<empty body>").slice(0, 500);
    throw new Error(
      `${member.name} returned an empty OpenRouter response after ${OPENROUTER_MAX_ATTEMPTS} attempts (${lastReason}). Raw: ${snippet}`,
    );
  }

  // The loop always returns or throws above; this satisfies the type checker.
  throw new Error(`${member.name} OpenRouter request failed (${lastReason}).`);
}

async function askCodex(member: ModelCouncilMember, messages: ChatMessage[]): Promise<string> {
  const codexPath = await getCodexExecutablePath();
  const codex = codexPath ? new Codex({ codexPathOverride: codexPath }) : new Codex();
  const thread = codex.startThread({
    model: member.model,
    modelReasoningEffort: DEFAULT_CHATGPT_REASONING_EFFORT,
    sandboxMode: "read-only",
    workingDirectory: process.cwd(),
    skipGitRepoCheck: true,
    approvalPolicy: "never",
    networkAccessEnabled: false,
    webSearchEnabled: false,
  });

  const prompt = messages
    .map((message) => `${message.role.toUpperCase()}: ${flattenMessageContent(message.content)}`)
    .join("\n\n");
  const turn = await thread.run(prompt);
  const content = normalizeOptionalString(turn.finalResponse);
  if (!content) {
    throw new Error(`${member.name} returned an empty Codex response.`);
  }

  return content;
}

async function askClaude(member: ModelCouncilMember, messages: ChatMessage[]): Promise<string> {
  const claudeCodePath = await getClaudeCodeExecutablePath();
  const prompt = messages
    .map((message) => `${message.role.toUpperCase()}: ${flattenMessageContent(message.content)}`)
    .join("\n\n");

  const response = query({
    prompt,
    options: {
      pathToClaudeCodeExecutable: claudeCodePath,
      model: member.model,
      permissionMode: "default",
      settingSources: ["user"],
      // Council members reason and reply with text only; deny every tool so the
      // member produces a direct response instead of acting on the workspace.
      canUseTool: async () => ({
        behavior: "deny",
        message: "Council members reply with text only; tools are disabled.",
        interrupt: false,
      }),
    },
  });

  let finalText: string | null = null;
  let resultError: string | null = null;
  for await (const message of response) {
    if (message.type !== "result") {
      continue;
    }
    const result = message as {
      subtype?: string;
      is_error?: boolean;
      result?: unknown;
      error?: unknown;
      errors?: string[];
    };
    if (result.is_error || (result.subtype && result.subtype !== "success")) {
      resultError =
        normalizeOptionalString(result.result) ??
        normalizeOptionalString(result.errors?.filter(Boolean).join("; ")) ??
        normalizeOptionalString(result.error) ??
        "Claude council member failed.";
    } else {
      finalText = normalizeOptionalString(result.result);
    }
  }

  if (resultError) {
    throw new Error(`${member.name} ${resultError}`);
  }
  const content = normalizeOptionalString(finalText);
  if (!content) {
    throw new Error(`${member.name} returned an empty Claude response.`);
  }

  return content;
}

export function buildProposalMessages(prompt: string, member: ModelCouncilMember): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        `You are ${member.name}, one member of a multi-agent council.`,
        OBJECTIVE_CONSENSUS_DIRECTIVE,
        "Give your independent answer to the user's problem.",
        "Be concrete, identify risks, state your recommended solution, and flag what would change your mind.",
      ].join(" "),
    },
    {
      role: "user",
      content: prompt,
    },
  ];
}

export function buildDeliberationMessages(
  prompt: string,
  responses: ModelCouncilResponse[],
  previousProposals: ModelCouncilCandidateProposal[],
  candidateConsensus: string,
  member: ModelCouncilMember,
  roundIndex = 1,
): ChatMessage[] {
  // The static prefix (system + original request) is identical across every
  // deliberation round, so it forms a cacheable prefix. The round number lives
  // in the dynamic section below to keep that prefix byte-stable for caching.
  const dynamic: string[] = [`This is deliberation round ${roundIndex}.`, ""];
  // The initial independent proposals are only needed in round 1; from round 2
  // on, the candidate consensus and the latest peer proposals carry the state,
  // so we stop re-sending the (large) initial proposals every round.
  if (roundIndex <= 1) {
    dynamic.push(formatCouncilResponses("Initial council proposals", responses), "");
  }
  dynamic.push(
    "Current candidate consensus:",
    candidateConsensus || "(none yet)",
    "",
    previousProposals.length > 0
      ? formatCouncilResponses("Latest peer proposed candidate solutions", previousProposals)
      : "Latest peer proposed candidate solutions:\n(none yet)",
    "",
    "Return your critique, then CANDIDATE_CONSENSUS: followed by the full candidate consensus text.",
  );

  return [
    {
      role: "system",
      content: [
        `You are ${member.name}, one member of a multi-agent council deliberation.`,
        OBJECTIVE_CONSENSUS_DIRECTIVE,
        "Read every initial proposal, the current candidate consensus, and the other agents' latest proposed solutions.",
        "Challenge weak reasoning, adopt stronger reasoning from peers, and produce the exact candidate consensus text you would be willing to ratify.",
        "Name remaining disagreements only if they materially affect the final recommendation.",
        "Your response must contain a CANDIDATE_CONSENSUS: section with the full candidate answer. Keep the candidate unchanged if it is already the maximal solution.",
      ].join(" "),
    },
    {
      role: "user",
      content: [
        { type: "text", text: `Original request:\n${prompt}`, cache_control: { type: "ephemeral" } },
        { type: "text", text: `\n\n${dynamic.join("\n")}` },
      ],
    },
  ];
}

export function buildRatificationMessages(
  prompt: string,
  rounds: ModelCouncilRound[],
  candidateConsensus: string,
  member: ModelCouncilMember,
): ChatMessage[] {
  // Ratifiers participated in every round, so they only need the artifact to
  // ratify plus the latest peer positions — not the full deliberation history,
  // which re-sent every round's full proposals to every member (O(rounds*members)).
  const finalRound = rounds.at(-1);
  const finalPositions = finalRound
    ? formatCouncilResponses("Final peer positions (latest deliberation round)", finalRound.proposals)
    : "Final peer positions (latest deliberation round):\n(none)";
  return [
    {
      role: "system",
      content: [
        `You are ${member.name}, one peer in a multi-agent consensus council. You are not a chair.`,
        OBJECTIVE_CONSENSUS_DIRECTIVE,
        "Decide whether the exact candidate consensus artifact has reached real consensus after reading the latest peer positions.",
        "Return ACCEPT only if you can endorse the exact candidate consensus without material objection.",
        "Return BLOCK if material disagreement remains, evidence is insufficient, or the proposed direction is weaker than an alternative.",
        "Start your response with exactly one marker line: CONSENSUS: ACCEPT or CONSENSUS: BLOCK.",
        "After the marker, state the consensus answer you accept, or the blocker that prevents consensus.",
      ].join(" "),
    },
    {
      role: "user",
      content: [
        "Original request:",
        prompt,
        "",
        finalPositions,
        "",
        "Candidate consensus artifact to ratify:",
        candidateConsensus,
      ].join("\n"),
    },
  ];
}

function parseRatificationAccepted(content: string): boolean {
  const marker = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  return /^CONSENSUS:\s*ACCEPT\b/i.test(marker ?? "");
}

function parseCandidateConsensus(content: string): string {
  const marker = "CANDIDATE_CONSENSUS:";
  const index = content.toUpperCase().indexOf(marker);
  if (index < 0) {
    return content.trim();
  }
  return content.slice(index + marker.length).trim();
}

function buildCandidateConsensus(proposals: ModelCouncilCandidateProposal[]): string {
  const normalizedCandidates = new Set(
    proposals
      .map((proposal) => normalizeCandidate(proposal.candidateConsensus))
      .filter((candidate) => candidate.length > 0),
  );
  if (normalizedCandidates.size === 1) {
    return proposals.find((proposal) => proposal.candidateConsensus.trim().length > 0)?.candidateConsensus.trim() ?? "";
  }
  return [
    "Candidate consensus is not yet unified. Peer candidate drafts:",
    ...proposals.map((proposal) =>
      [`## ${proposal.member.name} (${proposal.member.model})`, proposal.candidateConsensus.trim()].join("\n"),
    ),
  ].join("\n\n");
}

function candidateChanged(previousCandidate: string, nextCandidate: string): boolean {
  return normalizeCandidate(previousCandidate) !== normalizeCandidate(nextCandidate);
}

function normalizeCandidate(candidate: string): string {
  return candidate.trim().replace(/\s+/g, " ");
}

// A round is converged once its shared candidate is either byte-identical to the
// previous round's (changed === false) or near-identical (token similarity at or
// above the threshold). The near-convergence arm lets the council ratify a draft
// that has effectively stabilized instead of looping until it stops changing.
function isConverged(round: ModelCouncilRound): boolean {
  if (!round.changed) {
    return true;
  }
  return round.similarityToPrevious !== null && round.similarityToPrevious >= DEFAULT_CONVERGENCE_SIMILARITY_THRESHOLD;
}

function resolveMaxRounds(): number {
  const raw = readEnv("AGENTS_COUNCIL_MAX_ROUNDS");
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_MAX_CONSENSUS_ROUNDS;
}

// Token-set Jaccard similarity in [0, 1]. Used to quantify how much the shared
// candidate changed between rounds and how closely the members' drafts agree.
function tokenSet(text: string): Set<string> {
  return new Set(text.toLowerCase().match(/[a-z0-9]+/g) ?? []);
}

function tokenSimilarity(a: string, b: string): number {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (setA.size === 0 && setB.size === 0) {
    return 1;
  }
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersection++;
    }
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

function averagePairwiseSimilarity(texts: string[]): number {
  const usable = texts.filter((text) => text.trim().length > 0);
  if (usable.length < 2) {
    return 1;
  }
  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < usable.length; i++) {
    for (let j = i + 1; j < usable.length; j++) {
      sum += tokenSimilarity(usable[i]!, usable[j]!);
      pairs++;
    }
  }
  return pairs === 0 ? 1 : sum / pairs;
}

function buildConsensusResult(
  ratifications: ModelCouncilRatification[],
  members: ModelCouncilMember[],
  converged: boolean,
): ModelCouncilConsensus {
  if (!converged) {
    return {
      reached: false,
      ratifiedBy: [],
      blockedBy: members.map((member) => member.name),
    };
  }
  const ratifiedBy = ratifications
    .filter((ratification) => ratification.accepted)
    .map((ratification) => ratification.member.name);
  const blockedBy = ratifications
    .filter((ratification) => !ratification.accepted)
    .map((ratification) => ratification.member.name);
  return {
    reached: blockedBy.length === 0 && ratifiedBy.length === ratifications.length,
    ratifiedBy,
    blockedBy,
  };
}

function formatCouncilResponses(title: string, responses: ModelCouncilResponse[]): string {
  return [
    title + ":",
    ...responses.map((response) =>
      [`## ${response.member.name} (${response.member.model})`, response.content].join("\n"),
    ),
  ].join("\n\n");
}

function readEnv(name: string): string | null {
  return normalizeOptionalString(process.env[name]);
}

function normalizeRequiredString(value: unknown, label: string): string {
  const normalized = normalizeOptionalString(value);
  if (!normalized) {
    throw new Error(`${label} is required.`);
  }
  return normalized;
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

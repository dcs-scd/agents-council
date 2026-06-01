import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { Codex } from "@openai/codex-sdk";
import { query } from "@anthropic-ai/claude-agent-sdk";

import { getClaudeCodeExecutablePath, getCodexExecutablePath, getGeminiExecutablePath } from "./council/summon";
import { OBJECTIVE_CONSENSUS_DIRECTIVE } from "./council/objectiveConsensusPrompt";
import { resolveDeliberationsDir } from "../state/path";

const OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_KIMI_MODEL = "moonshotai/kimi-k2.6";
const DEFAULT_DEEPSEEK_MODEL = "deepseek/deepseek-v4-pro";
// Gemini moved off OpenRouter to the official `@google/gemini-cli` (Google's
// open-source CLI authenticated via `gemini auth login` against the user's
// Google account — the same subscription path Claude/Codex use through their
// own CLIs). Slug is plain (no provider prefix); override via
// AGENTS_COUNCIL_GEMINI_MODEL if Google's actual model id differs.
const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const DEFAULT_CHATGPT_MODEL = "gpt-5.5";
const DEFAULT_CHATGPT_REASONING_EFFORT = "xhigh" as const;
const DEFAULT_CLAUDE_MODEL = "claude-opus-4-7";
const MEMBERS_ENV = "AGENTS_COUNCIL_MEMBERS";
const OPENROUTER_TIMEOUT_ENV = "AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS";
const OPENROUTER_URL_ENV = "AGENTS_COUNCIL_OPENROUTER_URL";
const DEFAULT_OPENROUTER_TIMEOUT_MS = 300_000;
const MIN_OPENROUTER_TIMEOUT_MS = 50;
// Maximum deliberation rounds before the council stops looping. Overridable via
// AGENTS_COUNCIL_MAX_ROUNDS. Raised from 4 to 6 because runs were hitting the cap
// while still actively converging (see the convergence trajectory in the result).
const DEFAULT_MAX_CONSENSUS_ROUNDS = 6;
// Near-convergence threshold: when a round's shared candidate is at least this
// token-similar to the previous round's, treat it as converged and proceed to
// ratification instead of looping until the drafts are byte-identical (which
// verbose models effectively never reach). Overridable via
// AGENTS_COUNCIL_CONVERGENCE_SIMILARITY_THRESHOLD.
const DEFAULT_CONVERGENCE_SIMILARITY_THRESHOLD = 0.95;
// Member-agreement convergence threshold: independent reasoners producing
// substantively identical answers in different prose typically score 0.7–0.9 on
// pairwise token-set Jaccard. 0.95 between consecutive round drafts is too strict
// for free-form prose and was the root cause of councils never converging despite
// unanimous substantive agreement. Overridable via
// AGENTS_COUNCIL_CONVERGENCE_AGREEMENT_THRESHOLD. Set to 1.0 to disable this arm.
const DEFAULT_CONVERGENCE_AGREEMENT_THRESHOLD = 0.8;

export type ModelCouncilMember = {
  id: "kimi" | "deepseek" | "gemini" | "chatgpt" | "claude";
  name: string;
  provider: "openrouter" | "gemini" | "codex" | "claude";
  model: string;
};

// A minimal, serialization-safe projection of ModelCouncilMember for use in
// per-turn records (responses, deliberations, ratifications). Keeping this
// narrow ensures (a) JSON output isn't bloated with id/provider on every turn
// and (b) future additions to ModelCouncilMember (e.g. provider config, header
// hints) cannot accidentally leak into every saved deliberation file.
export type MemberRef = Pick<ModelCouncilMember, "name" | "model">;

function toMemberRef(member: ModelCouncilMember): MemberRef {
  return { name: member.name, model: member.model };
}

export type ModelCouncilResponse = {
  member: MemberRef;
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

// Three-state outcome of the ratify phase:
//   "ratified"      — every member voted ACCEPT; consensus reached.
//   "blocked"       — ratify ran and at least one member voted REJECT.
//   "not_attempted" — convergence was never detected, so ratify never ran.
// The previous shape (boolean `reached` + `blockedBy: string[]`) overloaded
// `blockedBy` to mean both "voted REJECT" (converged path) and "never voted"
// (non-converged path), which silently lied to callers about why consensus
// failed. With this field the two cases are distinguishable.
export type ModelCouncilConsensusOutcome = "ratified" | "blocked" | "not_attempted";

export type ModelCouncilConsensus = {
  reached: boolean;
  outcome: ModelCouncilConsensusOutcome;
  ratifiedBy: string[];
  blockedBy: string[];
  // Optional human-facing reason for non-ratification. Machines key off `outcome`.
  notRatifiedReason?: string;
};

// Record of a consensus-repair cycle. The council reasons in prose, so members
// who agree on substance routinely withhold ratification of the *exact* draft
// pending specific edits ("ACCEPT after these changes"). When that happens, one
// member synthesizes a revised artifact folding in the objections and the
// council re-ratifies it once. This captures the pre-repair state for the audit
// trail; the post-repair (decisive) values live on the parent result.
export type ModelCouncilRepair = {
  // The first-round ratifications that blocked the original candidate — each
  // carries the member's stated objection / path-to-accept.
  priorRatifications: ModelCouncilRatification[];
  // The revised candidate synthesized from those objections, then re-ratified.
  revisedCandidate: string;
  // Which member synthesized the revision.
  synthesizedBy: MemberRef;
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
  // Present only when a converged candidate was blocked and a single repair
  // cycle ran. `candidateConsensus` and `ratifications` above are then the
  // post-repair (decisive) values.
  repair?: ModelCouncilRepair;
  consensus: ModelCouncilConsensus;
};

export type RunModelCouncilInput = {
  prompt: string;
};

export type ModelCouncilFailure = {
  schema_version: "agents-council.model_council_failure.v1";
  generatedAt: string;
  prompt: string;
  error: string;
  members: ModelCouncilMember[];
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
      member: toMemberRef(member),
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
          member: toMemberRef(member),
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

  let ratifications = converged ? await ratifyCandidate(members, prompt, rounds, candidateConsensus) : [];

  // Consensus repair (one bounded cycle). The council reasons in prose, so two
  // members who agree on substance routinely fail to emit byte-identical drafts
  // and instead ratify "ACCEPT after these specific edits" as a BLOCK with a
  // stated path-to-accept. A single ratify round throws that agreement away and
  // records "blocked". When a converged candidate is blocked, let one designated
  // member synthesize a revised artifact that folds in the blockers' objections,
  // then re-ratify it once. If the revision still does not earn unanimous
  // acceptance, the disagreement is real and the outcome stays "blocked".
  let repair: ModelCouncilRepair | undefined;
  if (shouldAttemptRepair(ratifications)) {
    const synthesizer = members[0]!;
    const revisedCandidate = parseCandidateConsensus(
      await askMember(synthesizer, buildSynthesisMessages(prompt, candidateConsensus, ratifications, synthesizer)),
    );
    if (revisedCandidate.length > 0 && candidateChanged(candidateConsensus, revisedCandidate)) {
      repair = {
        priorRatifications: ratifications,
        revisedCandidate,
        synthesizedBy: toMemberRef(synthesizer),
      };
      ratifications = await ratifyCandidate(members, prompt, rounds, revisedCandidate);
      candidateConsensus = revisedCandidate;
    }
  }

  return {
    prompt,
    members,
    responses,
    deliberations,
    rounds,
    candidateConsensus,
    converged,
    ratifications,
    repair,
    consensus: buildConsensusResult(ratifications, members, converged),
  };
}

// Ratify a single candidate artifact: every member independently votes
// ACCEPT/BLOCK after reading the latest peer positions. Shared by the first
// ratify round and the post-repair re-ratify so both use one implementation.
async function ratifyCandidate(
  members: ModelCouncilMember[],
  prompt: string,
  rounds: ModelCouncilRound[],
  candidateConsensus: string,
): Promise<ModelCouncilRatification[]> {
  return Promise.all(
    members.map(async (member) => {
      const content = await askMember(member, buildRatificationMessages(prompt, rounds, candidateConsensus, member));
      return {
        member: toMemberRef(member),
        content,
        accepted: parseRatificationAccepted(content),
      };
    }),
  );
}

// True when ratification ran and at least one member withheld acceptance. Such a
// block is frequently conditional ("ACCEPT after these edits") rather than a hard
// veto, so it is worth one synthesis-and-re-ratify repair cycle before recording
// "blocked".
export function shouldAttemptRepair(ratifications: ModelCouncilRatification[]): boolean {
  return ratifications.length > 0 && ratifications.some((ratification) => !ratification.accepted);
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
    `- Outcome: ${result.consensus.outcome}${result.consensus.notRatifiedReason ? ` (${result.consensus.notRatifiedReason})` : ""}`,
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

  if (result.repair) {
    lines.push(
      "",
      "## Consensus Repair",
      "",
      `The first ratification round blocked, but the objections came with a concrete path to accept. ${result.repair.synthesizedBy.name} synthesized a revised artifact folding in those edits, and the council re-ratified it (one bounded repair cycle).`,
      "",
      "### First-round objections",
    );
    for (const ratification of result.repair.priorRatifications) {
      const verdict = ratification.accepted ? "ACCEPT" : "BLOCK";
      lines.push("", `#### ${ratification.member.name} — ${verdict}`, "", ratification.content);
    }
    lines.push("", "### Revised candidate", "", result.repair.revisedCandidate);
  }

  lines.push("", result.repair ? "## Peer Ratifications (after repair)" : "## Peer Ratifications");
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

export async function saveModelCouncilFailure(input: { prompt: string; error: string }): Promise<{
  jsonPath: string;
  markdownPath: string;
}> {
  const deliberationsDir = resolveDeliberationsDir();
  await mkdir(deliberationsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = path.join(deliberationsDir, `council-failed-${timestamp}.json`);
  const markdownPath = path.join(deliberationsDir, `council-failed-${timestamp}.md`);
  const failure: ModelCouncilFailure = {
    schema_version: "agents-council.model_council_failure.v1",
    generatedAt: new Date().toISOString(),
    prompt: input.prompt,
    error: input.error,
    members: buildDefaultMembers(),
  };
  await writeFile(jsonPath, `${JSON.stringify(failure, null, 2)}\n`, "utf8");
  await writeFile(markdownPath, formatModelCouncilFailureMarkdown(failure), "utf8");
  return { jsonPath, markdownPath };
}

function formatModelCouncilFailureMarkdown(failure: ModelCouncilFailure): string {
  return [
    "# Council Failed",
    "",
    `_Generated ${failure.generatedAt}_`,
    "",
    "The council did not complete. This is a failure transcript, not a consensus result.",
    "",
    "## Error",
    "",
    failure.error,
    "",
    "## Members",
    "",
    ...failure.members.map((member) => `- **${member.name}** — \`${member.model}\` (${member.provider})`),
    "",
    "## Question",
    "",
    failure.prompt || "(none)",
    "",
  ].join("\n");
}

function validateCouncilConfig(members: ModelCouncilMember[]): void {
  if (members.some((member) => member.provider === "openrouter") && !readEnv("OPENROUTER_API_KEY")) {
    throw new Error("OPENROUTER_API_KEY is required for the Kimi and DeepSeek council members.");
  }
  // Gemini CLI presence is checked lazily inside askGemini — the executable
  // resolution mirrors getCodexExecutablePath() and lets the error fire with
  // install instructions only when a Gemini member actually runs.
}

export function buildDefaultMembers(): ModelCouncilMember[] {
  const members: ModelCouncilMember[] = [
    {
      id: "kimi",
      name: "Kimi K2.6",
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
      provider: "gemini",
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
  return selectConfiguredMembers(members);
}

function selectConfiguredMembers(members: ModelCouncilMember[]): ModelCouncilMember[] {
  const raw = readEnv(MEMBERS_ENV);
  if (!raw) {
    return members;
  }
  const requested = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (requested.length === 0) {
    return members;
  }
  const selected = members.filter(
    (member) => requested.includes(member.id) || requested.includes(member.name.toLowerCase()),
  );
  if (selected.length === 0) {
    throw new Error(`${MEMBERS_ENV} did not match any council members: ${raw}`);
  }
  return selected;
}

async function askMember(member: ModelCouncilMember, messages: ChatMessage[]): Promise<string> {
  if (member.provider === "openrouter") {
    return askOpenRouter(member, messages);
  }
  if (member.provider === "gemini") {
    return askGemini(member, messages);
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
    throw new Error("OPENROUTER_API_KEY is required for the OpenRouter council members (Kimi, DeepSeek).");
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
  const timeoutMs = resolveOpenRouterTimeoutMs();
  const url = readEnv(OPENROUTER_URL_ENV) ?? OPENROUTER_CHAT_COMPLETIONS_URL;

  let lastReason = "no content/reasoning returned";
  for (let attempt = 1; attempt <= OPENROUTER_MAX_ATTEMPTS; attempt++) {
    let response: Response;
    let rawText: string;
    try {
      ({ response, rawText } = await fetchTextWithTimeout(
        url,
        {
          method: "POST",
          headers,
          body: requestBody,
        },
        timeoutMs,
      ));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      lastReason = detail;
      if (attempt < OPENROUTER_MAX_ATTEMPTS) {
        await delay(attempt * 500);
        continue;
      }
      throw new Error(`${member.name} OpenRouter request failed after ${OPENROUTER_MAX_ATTEMPTS} attempts: ${detail}`);
    }

    // Read the raw text first so an empty / non-JSON body stays diagnosable.
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

// Bun 1.3.11's fetch() hangs on long-running OpenRouter responses to reasoning
// models (Kimi K2.6 etc.) — the Promise never resolves even though headers
// arrive within ~2s. Diagnosed 2026-05-28: same body via curl from the same
// Bun process completes in ~150s; Bun fetch hangs past 300s. Until Bun's HTTP
// client fixes this, route OpenRouter calls through curl. Inputs/outputs match
// the original fetch wrapper exactly so the caller (askOpenRouter) is unchanged.
async function fetchTextWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<{ response: Response; rawText: string }> {
  const STATUS_SENTINEL = "\n__BUN_CURL_HTTP_STATUS__:";
  const headerArgs: string[] = [];
  const headersInit = init.headers as Record<string, string> | undefined;
  if (headersInit) {
    for (const [key, value] of Object.entries(headersInit)) {
      headerArgs.push("-H", `${key}: ${value}`);
    }
  }
  const method = (init.method ?? "GET").toUpperCase();
  const body = typeof init.body === "string" ? init.body : null;
  const timeoutSeconds = Math.max(1, Math.ceil(timeoutMs / 1000));

  const args = [
    "-sS",
    "-X",
    method,
    "--max-time",
    String(timeoutSeconds),
    ...headerArgs,
    ...(body !== null ? ["--data-binary", "@-"] : []),
    "--write-out",
    `${STATUS_SENTINEL}%{http_code}`,
    url,
  ];

  const proc = Bun.spawn(["curl", ...args], {
    stdin: body !== null ? "pipe" : "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });

  if (body !== null && proc.stdin) {
    // proc.stdin is a Bun FileSink (write+end), not a WHATWG WritableStream.
    const sink = proc.stdin;
    sink.write(body);
    sink.end();
  }

  const [stdoutText, stderrText, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  if (exitCode === 28) {
    // curl exit code 28 = operation timed out
    throw new Error(`timed out after ${timeoutMs}ms before complete response body`);
  }
  if (exitCode !== 0) {
    const stderrSnippet = stderrText.trim().slice(0, 300) || "no stderr output";
    throw new Error(`curl failed (exit ${exitCode}): ${stderrSnippet}`);
  }

  const sentinelIndex = stdoutText.lastIndexOf(STATUS_SENTINEL);
  if (sentinelIndex < 0) {
    const tail = stdoutText.slice(-200);
    throw new Error(`curl response missing status trailer; tail="${tail}"`);
  }
  const statusText = stdoutText.slice(sentinelIndex + STATUS_SENTINEL.length).trim();
  const status = Number.parseInt(statusText, 10);
  if (!Number.isFinite(status)) {
    throw new Error(`curl returned non-numeric HTTP status: "${statusText}"`);
  }
  const rawText = stdoutText.slice(0, sentinelIndex);

  // askOpenRouter only reads .ok, .status, and .statusText off the Response.
  // Construct a minimal duck-typed object rather than `new Response(rawText,
  // { status })` because the WHATWG Response constructor restricts status to
  // [200, 599] and rejects e.g. 100/600+ which OpenRouter could theoretically
  // surface from an upstream proxy.
  const response = {
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
  } as Response;

  return { response, rawText };
}

export function resolveOpenRouterTimeoutMs(): number {
  const raw = readEnv(OPENROUTER_TIMEOUT_ENV);
  if (!raw) {
    return DEFAULT_OPENROUTER_TIMEOUT_MS;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < MIN_OPENROUTER_TIMEOUT_MS) {
    return DEFAULT_OPENROUTER_TIMEOUT_MS;
  }
  return parsed;
}

const GEMINI_MAX_ATTEMPTS = 3;

async function askGemini(member: ModelCouncilMember, messages: ChatMessage[]): Promise<string> {
  const geminiPath = await getGeminiExecutablePath();
  if (!geminiPath) {
    throw new Error(
      `${member.name}: gemini CLI not found. Install the official Google Gemini CLI ` +
        "with `npm install -g @google/gemini-cli`, then run `gemini auth login` once to " +
        "authenticate with the Google account that owns your Gemini / Google AI Pro subscription. " +
        "Override the resolved binary with the GEMINI_PATH env var if it lives elsewhere.",
    );
  }

  // The Gemini CLI takes a plain prompt (no OpenAI-style chat-message array),
  // so we collapse the multi-turn exchange the same way askCodex does, with
  // explicit role markers. cache_control hints in ChatContentPart[] are
  // discarded — Google's context-caching lives in a separate `cachedContents`
  // API not exposed through the CLI, and per-deliberation rounds would not
  // amortize the setup cost. The prompt is piped via stdin to avoid ARG_MAX
  // truncation on large file-inlined deliberations from council-solve.ts.
  const prompt = messages
    .map((message) => `${message.role.toUpperCase()}: ${flattenMessageContent(message.content)}`)
    .join("\n\n");

  let lastReason = "no output";
  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
    const proc = Bun.spawn([geminiPath, "-m", member.model], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });
    proc.stdin.write(prompt);
    await proc.stdin.end();
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    if (exitCode === 0) {
      const content = stdout.trim();
      if (content) {
        return content;
      }
      lastReason = "exit 0 with empty stdout";
    } else {
      const stderrSnippet = stderr.trim().slice(0, 500);
      lastReason = `exit ${exitCode}${stderrSnippet ? `: ${stderrSnippet}` : ""}`;
    }

    if (attempt < GEMINI_MAX_ATTEMPTS) {
      await delay(attempt * 500);
      continue;
    }
    throw new Error(`${member.name} Gemini CLI failed after ${GEMINI_MAX_ATTEMPTS} attempts: ${lastReason}`);
  }

  // The loop always returns or throws above; this satisfies the type checker.
  throw new Error(`${member.name} Gemini CLI failed (${lastReason}).`);
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

// Prompt one member to synthesize a single revised consensus artifact that folds
// in every blocking ratifier's required edits. Used by the bounded repair cycle:
// the members already agree on substance, so this resolves the residual "ACCEPT
// after these edits" deltas into one artifact the council then re-ratifies.
export function buildSynthesisMessages(
  prompt: string,
  candidateConsensus: string,
  ratifications: ModelCouncilRatification[],
  member: ModelCouncilMember,
): ChatMessage[] {
  const objections = ratifications
    .filter((ratification) => !ratification.accepted)
    .map((ratification) => [`## ${ratification.member.name}`, ratification.content].join("\n"))
    .join("\n\n");
  return [
    {
      role: "system",
      content: [
        `You are ${member.name}, synthesizing the final consensus artifact for a multi-agent council.`,
        OBJECTIVE_CONSENSUS_DIRECTIVE,
        "The peers agree on the substance, but at least one withheld ratification of the exact draft pending specific edits.",
        "Produce a single revised candidate that incorporates every well-founded required edit while preserving everything the peers already endorsed.",
        "Do not introduce new claims, do not weaken correctness to manufacture agreement, and keep any objection a peer raised on the merits if it is correct.",
        "Your response must contain a CANDIDATE_CONSENSUS: section with the full revised artifact.",
      ].join(" "),
    },
    {
      role: "user",
      content: [
        "Original request:",
        prompt,
        "",
        "Current candidate consensus artifact:",
        candidateConsensus,
        "",
        "Peer objections and required edits (these withheld ratification):",
        objections || "(none recorded)",
        "",
        "Return the revised artifact after a CANDIDATE_CONSENSUS: marker.",
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

export function buildCandidateConsensus(proposals: ModelCouncilCandidateProposal[]): string {
  const drafts = proposals
    .map((proposal) => proposal.candidateConsensus.trim())
    .filter((candidate) => candidate.length > 0);
  if (drafts.length === 0) {
    return "";
  }
  const normalizedCandidates = new Set(drafts.map((draft) => normalizeCandidate(draft)));
  if (normalizedCandidates.size === 1) {
    return drafts[0]!;
  }
  // The members agree substantively but their drafts are not byte-identical —
  // verbose reasoners effectively never converge to identical prose. Emitting a
  // stitched "not yet unified" blob here is fatal: it is unratifiable by
  // construction (it literally announces its own non-unification, forcing every
  // ratifier to BLOCK). Instead nominate the single most-complete draft as the
  // candidate so the ratify phase votes on one coherent artifact; the repair
  // cycle in runModelCouncil then folds in any peer-required edits.
  return drafts.reduce((best, draft) => (draft.length > best.length ? draft : best));
}

function candidateChanged(previousCandidate: string, nextCandidate: string): boolean {
  return normalizeCandidate(previousCandidate) !== normalizeCandidate(nextCandidate);
}

function normalizeCandidate(candidate: string): string {
  return candidate.trim().replace(/\s+/g, " ");
}

// A round is converged once any of three arms fire:
//   1. byte-identical to the previous round's shared candidate (changed === false);
//   2. the shared candidate is near-identical between rounds (similarityToPrevious
//      ≥ DEFAULT_CONVERGENCE_SIMILARITY_THRESHOLD) — fast-path for verbose models
//      that effectively never produce byte-identical drafts;
//   3. the members' own candidate drafts agree with each other within this round
//      (memberAgreement ≥ DEFAULT_CONVERGENCE_AGREEMENT_THRESHOLD) — measures the
//      thing we actually care about ("do the members agree?"), which the previous
//      sim-only criterion did not directly capture.
// Either of (2) or (3) firing means convergence; this is a strict superset of the
// previous behavior. See council_output_shape_bugs_proposal.md (Bug 3) for why
// the sim-only arm was insufficient.
function isConverged(round: ModelCouncilRound): boolean {
  if (!round.changed) {
    return true;
  }
  const simThreshold = resolveConvergenceSimilarityThreshold();
  if (round.similarityToPrevious !== null && round.similarityToPrevious >= simThreshold) {
    return true;
  }
  const agreementThreshold = resolveConvergenceAgreementThreshold();
  if (Number.isFinite(round.memberAgreement) && round.memberAgreement >= agreementThreshold) {
    return true;
  }
  return false;
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

function resolveConvergenceSimilarityThreshold(): number {
  return resolveUnitFloatEnv(
    "AGENTS_COUNCIL_CONVERGENCE_SIMILARITY_THRESHOLD",
    DEFAULT_CONVERGENCE_SIMILARITY_THRESHOLD,
  );
}

function resolveConvergenceAgreementThreshold(): number {
  return resolveUnitFloatEnv("AGENTS_COUNCIL_CONVERGENCE_AGREEMENT_THRESHOLD", DEFAULT_CONVERGENCE_AGREEMENT_THRESHOLD);
}

// Parse a float env var clamped to [0, 1]; falls back to the default on missing,
// non-numeric, or out-of-range values. Used for both convergence threshold knobs.
function resolveUnitFloatEnv(envName: string, fallback: number): number {
  const raw = readEnv(envName);
  if (!raw) return fallback;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) return fallback;
  return parsed;
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
  _members: ModelCouncilMember[],
  converged: boolean,
): ModelCouncilConsensus {
  if (!converged) {
    // Ratify never ran; no member actually voted. Returning the full member
    // list under `blockedBy` (as the prior implementation did) was a lie —
    // it made non-convergence indistinguishable from unanimous rejection.
    return {
      reached: false,
      outcome: "not_attempted",
      ratifiedBy: [],
      blockedBy: [],
      notRatifiedReason: "no candidate consensus emerged before max rounds",
    };
  }
  const ratifiedBy = ratifications
    .filter((ratification) => ratification.accepted)
    .map((ratification) => ratification.member.name);
  const blockedBy = ratifications
    .filter((ratification) => !ratification.accepted)
    .map((ratification) => ratification.member.name);
  const reached = blockedBy.length === 0 && ratifiedBy.length === ratifications.length;
  return {
    reached,
    outcome: reached ? "ratified" : "blocked",
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

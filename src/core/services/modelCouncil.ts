import { appendFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { Codex } from "@openai/codex-sdk";
import { query } from "@anthropic-ai/claude-agent-sdk";

import { getClaudeCodeExecutablePath, getCodexExecutablePath, getGeminiExecutablePath } from "./council/summon";
import { OBJECTIVE_CONSENSUS_DIRECTIVE } from "./council/objectiveConsensusPrompt";
import { resolveDeliberationsDir } from "../state/path";

const OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions";
const MOONSHOT_CHAT_COMPLETIONS_URL = "https://api.moonshot.ai/v1/chat/completions";
const DEEPSEEK_CHAT_COMPLETIONS_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_KIMI_MODEL = "moonshotai/kimi-k2.6";
const DEFAULT_DEEPSEEK_MODEL = "deepseek/deepseek-v4-pro";
const DEFAULT_DIRECT_KIMI_MODEL = "kimi-k2.6";
const DEFAULT_DIRECT_DEEPSEEK_MODEL = "deepseek-v4-pro";
// Gemini moved off OpenRouter to the official `@google/gemini-cli` (Google's
// open-source CLI authenticated via `gemini auth login` against the user's
// Google account — the same subscription path Claude/Codex use through their
// own CLIs). Slug is plain (no provider prefix); override via
// AGENTS_COUNCIL_GEMINI_MODEL if Google's actual model id differs.
const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const DEFAULT_CHATGPT_MODEL = "gpt-5.5";
const DEFAULT_CHATGPT_REASONING_EFFORT = "xhigh" as const;
const DEFAULT_CLAUDE_MODEL = "claude-opus-4-8";
const MEMBERS_ENV = "AGENTS_COUNCIL_MEMBERS";
// Default council roster when AGENTS_COUNCIL_MEMBERS is unset: an odd,
// heterogeneous, three-member panel — Opus 4.8 (Claude), GPT-5.5 at xhigh
// reasoning (ChatGPT/Codex), and Gemini 3.5 Flash. All three resolve through
// locally-credentialed CLIs (claude/codex/gemini) and require no API-key env at
// config-validation time, so the default run never depends on OPENROUTER_API_KEY
// or a vendor key. Claude is listed first so it chairs synthesis (members[0]).
// Set AGENTS_COUNCIL_MEMBERS to choose any other roster, e.g. "chatgpt,claude"
// for a cheap two-member draft or "kimi,deepseek,gemini,chatgpt,claude" for the
// full panel.
const DEFAULT_MEMBER_IDS = ["claude", "chatgpt", "gemini"] as const;
// WU-B5 brief-size precheck budgets, in tokens, per member id. These values are
// DELIBERATELY CONSERVATIVE lower bounds — the smallest context each member is
// assumed to serve reliably — so the advisory over-budget warning fires early
// (before a silent upstream truncation) rather than promising a model's true
// maximum. Override any of them with AGENTS_COUNCIL_CONTEXT_TOKENS_<ID>. The
// precheck is advisory: an over-budget estimate never hard-fails the run.
const DEFAULT_MEMBER_CONTEXT_TOKENS: Record<ModelCouncilMember["id"], number> = {
  kimi: 128_000,
  deepseek: 128_000,
  gemini: 128_000,
  chatgpt: 128_000,
  claude: 128_000,
};
const OPENROUTER_TIMEOUT_ENV = "AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS";
const OPENROUTER_URL_ENV = "AGENTS_COUNCIL_OPENROUTER_URL";
const DIRECT_VENDOR_KEYS_ENV = "AGENTS_COUNCIL_DIRECT_VENDOR_KEYS";
const MOONSHOT_API_KEY_ENV = "MOONSHOT_API_KEY";
const DEEPSEEK_API_KEY_ENV = "DEEPSEEK_API_KEY";
const MOONSHOT_URL_ENV = "AGENTS_COUNCIL_MOONSHOT_URL";
const DEEPSEEK_URL_ENV = "AGENTS_COUNCIL_DEEPSEEK_URL";
const DEFAULT_OPENROUTER_TIMEOUT_MS = 300_000;
const MIN_OPENROUTER_TIMEOUT_MS = 50;
// WU-B1: a single per-member timeout governs EVERY provider path (the SDK/CLI
// members that previously had no timeout, and the curl-based HTTP members).
// Precedence: AGENTS_COUNCIL_MEMBER_TIMEOUT_MS > AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS
// (legacy alias, still honored) > the shared 300s default.
const MEMBER_TIMEOUT_ENV = "AGENTS_COUNCIL_MEMBER_TIMEOUT_MS";
// WU-B5: when set to 1/true, a member whose round-0 brief is estimated over its
// context budget is dropped pre-spend (recorded via the WU-B3 drop machinery)
// instead of merely warned about. Advisory-only by default.
const DROP_OVERSIZED_ENV = "AGENTS_COUNCIL_DROP_OVERSIZED";
// WU-B5: per-member context-budget override prefix — AGENTS_COUNCIL_CONTEXT_TOKENS_<ID>
// (uppercased member id), e.g. AGENTS_COUNCIL_CONTEXT_TOKENS_KIMI.
const CONTEXT_TOKENS_ENV_PREFIX = "AGENTS_COUNCIL_CONTEXT_TOKENS_";
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
  provider: "openrouter" | "moonshot" | "deepseek" | "gemini" | "codex" | "claude";
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
  // (token-set Jaccard). Telemetry only as of F3 — no longer a convergence arm;
  // isConverged now keys on the members' self-reported CONSENSUS_STATUS, falling
  // back to a draft overlap coefficient. Kept for the rendered Convergence table.
  memberAgreement: number;
};

// A member's ratification verdict is ternary, not binary. ACCEPT_WITH_EDITS lets
// a member who agrees on substance but wants specific edits register that without
// it being read as a veto — the council folds the edits in via the repair cycle.
// A BLOCK carries a kind so the engine can later distinguish a repairable
// objection from an absolute veto (a factual error or material disagreement).
export type RatificationDecision = "accept" | "accept_with_edits" | "block";

export type RatificationBlockKind =
  | "MATERIAL_DISAGREEMENT"
  | "INSUFFICIENT_EVIDENCE"
  | "SYNTHESIS_ERROR"
  | "FACTUAL_ERROR"
  | "PROTOCOL";

export type RatificationVote = {
  decision: RatificationDecision;
  // Present only when decision === "block".
  blockKind?: RatificationBlockKind;
  // Present only when decision === "accept_with_edits": the edits the member
  // requires before it will accept, fed into the repair synthesis.
  requiredEdits?: string;
  // The raw ratification text, retained for the transcript and debugging.
  raw: string;
};

export type ModelCouncilRatification = ModelCouncilResponse & {
  // Derived convenience (`vote.decision === "accept"`). Preserved so the public
  // result contract (consensus.reached / ratifiedBy / blockedBy) and the CLI/MCP
  // renderers — which read this, never `vote` — keep working unchanged.
  accepted: boolean;
  vote: RatificationVote;
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

// The process exit-code contract for a finished council run (WU-B4). A `blocked`
// outcome is a hard stop — an absolute veto or an unresolved claim-ledger
// precondition — so the caller must see a non-zero exit; `ratified` and
// `not_attempted` are non-error completions. Extracted as a pure function so the
// veto -> non-zero-exit invariant is unit-testable without spawning the CLI (the
// `solve` action sets `process.exitCode` from this).
export function councilOutcomeExitCode(outcome: ModelCouncilConsensusOutcome): number {
  return outcome === "blocked" ? 1 : 0;
}

// A single recorded dissent in the minority report (WU-B4). Each entry is the
// stated objection of one member who withheld acceptance — including a member
// whose block carries an absolute veto (FACTUAL_ERROR / MATERIAL_DISAGREEMENT),
// which is how the WU-B2 claim-ledger preconditions surface: those preconditions
// raise a synthetic FACTUAL_ERROR ratification, so they appear here as dissent.
// The minority report is an additional field on the result, NOT a new outcome
// state — the top-level enum stays frozen at not_attempted|ratified|blocked (INV-6).
export type MinorityReportEntry = {
  member: string;
  // The block kind, when the member's vote carried one (a bare BLOCK has none).
  blockKind?: RatificationBlockKind;
  // True when the block is an absolute veto (F7) — a hard stop, not a repairable
  // objection. Lets a consumer separate vetoes from path-to-accept dissents.
  absolute: boolean;
  // The member's raw dissent text, preserved verbatim for the audit trail.
  dissent: string;
};

export type ModelCouncilConsensus = {
  reached: boolean;
  outcome: ModelCouncilConsensusOutcome;
  ratifiedBy: string[];
  blockedBy: string[];
  // Optional human-facing reason for non-ratification. Machines key off `outcome`.
  notRatifiedReason?: string;
  // Present only on a `blocked` outcome (WU-B4): the first-class record of every
  // dissent that prevented ratification, so a blocked run never silently drops the
  // minority's objections. Absent on ratified/not_attempted.
  minorityReport?: MinorityReportEntry[];
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
  // WU-B3: true when at least one member was dropped mid-run and the council
  // continued over the survivors. Absent/false on a full-roster run.
  degraded?: boolean;
  // WU-B3: every member dropped terminally mid-run, with the phase/round and the
  // reason (timeout, provider error, or oversized-brief pre-spend drop). Empty on
  // a full-roster run.
  droppedMembers?: CouncilDroppedMember[];
  // WU-B4: one entry per successful provider call (member/provider/phase/round,
  // wall time, prompt+response sizes, usage tokens where the API reports them).
  ledger?: CouncilLedgerEntry[];
  // WU-B4: aggregate totals across `ledger`. Pure observation — no control flow
  // reads either field.
  ledgerTotals?: CouncilLedgerTotals;
};

// WU-B3: the record of one member dropped terminally mid-run. `round` is null for
// the pre-round proposal phase, the WU-B5 pre-spend precheck, and ratification.
export type CouncilDroppedMember = {
  id: ModelCouncilMember["id"];
  phase: string;
  round: number | null;
  reason: string;
};

// WU-B4: token usage as reported by a provider, normalized across the vendor field
// names (OpenRouter/Moonshot/DeepSeek `prompt_tokens`/`completion_tokens`; Codex
// `input_tokens`/`output_tokens`; Claude `input_tokens`/`output_tokens`). null on
// any provider path (Gemini CLI, injected test asker) that reports no usage.
export type CouncilTokenUsage = {
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
};

// WU-B4: one per-call cost/latency ledger row. Pure observation.
export type CouncilLedgerEntry = {
  member: string;
  provider: ModelCouncilMember["provider"];
  phase: string;
  round: number | null;
  wallMs: number;
  promptChars: number;
  responseChars: number;
  usage: CouncilTokenUsage | null;
};

// WU-B4: aggregate totals across the ledger. Token totals are null unless at least
// one call reported the corresponding usage figure.
export type CouncilLedgerTotals = {
  calls: number;
  wallMs: number;
  promptChars: number;
  responseChars: number;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
};

// WU-B2: one line of the crash-insurance partial checkpoint
// (deliberations/council-<ts>.partial.jsonl). A completed member call carries
// `content` (proposal/deliberation/synthesis) or `votes` (ratification); a drop
// carries `id` + `reason` and no payload.
export type PartialPhaseRecord = {
  phase: string;
  round: number | null;
  member?: string;
  id?: ModelCouncilMember["id"];
  timestamp: string;
  content?: string;
  votes?: RatificationVote;
  reason?: string;
};

// WU-B2: the completed work salvaged from a partial checkpoint at failure time.
export type CouncilPartialSnapshot = {
  completedPhases: PartialPhaseRecord[];
  droppedMembers: CouncilDroppedMember[];
};

// A single evidence-pack entry supplied by the caller. Plumbing only (WU-B3):
// when present, entries are prepended to the round-0 proposal system message so
// members can cite them. WU-B2 will consume the `id` for the Level-1 source-ID
// check. Omitting the pack leaves proposal prompts byte-identical to legacy.
export type EvidencePackEntry = {
  id: string;
  text: string;
  source: string;
};

export type RunModelCouncilInput = {
  prompt: string;
  evidencePack?: EvidencePackEntry[];
};

export type ModelCouncilFailure = {
  schema_version: "agents-council.model_council_failure.v1";
  generatedAt: string;
  prompt: string;
  error: string;
  members: ModelCouncilMember[];
  // WU-B2: completed work salvaged from the run's partial checkpoint (proposals,
  // deliberation rounds, partial ratifications). Additive/optional — the schema
  // version is unchanged because a consumer that ignores these fields still reads
  // a valid v1 record. Absent when no work had completed before the failure.
  completedPhases?: PartialPhaseRecord[];
  // WU-B2/B3: any members dropped before the run failed, recovered from the
  // checkpoint. Absent when none were dropped.
  droppedMembers?: CouncilDroppedMember[];
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
  // Present on most OpenAI-compatible providers (OpenRouter/Moonshot/DeepSeek);
  // shape read tolerantly by toTokenUsage (WU-B4).
  usage?: unknown;
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

  // WU-B2/B3/B4: a per-run accumulator carries the shrinking survivor roster, the
  // drop ledger, the cost/latency ledger, and the crash-insurance checkpoint path.
  const state = await createRunState(prompt, members);

  // WU-B5: advisory brief-size precheck, before any spend. Warns (and, only under
  // AGENTS_COUNCIL_DROP_OVERSIZED=1, drops via the WU-B3 machinery) but never
  // hard-fails on an estimate alone.
  await briefSizePrecheck(state, input.evidencePack);

  // WU-B3: round-0 independent proposals over the surviving roster. A member that
  // fails terminally here is dropped; the phase throws only if the drop leaves
  // fewer than two survivors (checkpoint preserved for the failure record).
  const proposalContent = await runMemberPhase(state, "proposal", null, (member) =>
    askMember(member, buildProposalMessages(prompt, member, input.evidencePack), state, "proposal", null),
  );
  const responses: ModelCouncilResponse[] = state.active.map((member) => ({
    member: toMemberRef(member),
    content: proposalContent.get(member)!,
  }));

  const rounds: ModelCouncilRound[] = [];
  let candidateConsensus = "";
  let previousProposals: ModelCouncilCandidateProposal[] = [];
  const maxRounds = resolveMaxRounds();

  for (let index = 1; index <= maxRounds; index++) {
    const roundContent = await runMemberPhase(state, "deliberation", index, (member) =>
      askMember(
        member,
        buildDeliberationMessages(prompt, responses, previousProposals, candidateConsensus, member, index),
        state,
        "deliberation",
        index,
      ),
    );
    const proposals: ModelCouncilCandidateProposal[] = state.active.map((member) => {
      const content = roundContent.get(member)!;
      return {
        member: toMemberRef(member),
        content,
        candidateConsensus: parseCandidateConsensus(content),
      };
    });
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
  // Telemetry only: did an early-stop arm fire? It no longer gates ratification.
  const converged = Boolean(finalRound && isConverged(finalRound) && candidateConsensus.trim().length > 0);

  // F2: ratify whenever a non-empty candidate exists, NOT only when the Jaccard
  // convergence gate fired. Verbose reasoners agree on substance without producing
  // byte-identical or high-overlap drafts, so the old `converged ?` gate skipped
  // ratification entirely and recorded `not_attempted` even when the members in
  // fact agreed. The members' own ACCEPT/BLOCK votes are the real consensus test.
  const hasCandidate = candidateConsensus.trim().length > 0;
  let ratifications = hasCandidate ? await ratifyCandidate(state, prompt, rounds, candidateConsensus) : [];

  // WU-B2: claim-ledger ratification preconditions. Under AGENTS_COUNCIL_STRUCTURED
  // only (INV-2), inspect the structured claims the members emitted and prepend an
  // absolute FACTUAL_ERROR block (via the existing veto machinery) for any member
  // that emitted an unlabeled claim, an assumption with no cheapest_verification,
  // or a repo_fact citing an id absent from the evidence pack (INV-9: pure code).
  // With the flag off this is a no-op (returns []) and never imports the schema
  // module, so the ratification path stays byte-for-byte legacy. INV-3: these
  // blocks enter only the ratifications array, after the deliberation loop;
  // isConverged is never given them. An absolute veto here also short-circuits the
  // repair cycle below (shouldAttemptRepair), since synthesis cannot make an
  // unverifiable claim verifiable.
  if (hasCandidate) {
    const preconditionBlocks = await evaluateRatificationPreconditions(deliberations, input.evidencePack);
    if (preconditionBlocks.length > 0) {
      ratifications = [...preconditionBlocks, ...ratifications];
    }
  }

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
    // WU-B3: chair duties follow the surviving roster — the first survivor, not
    // necessarily the original members[0], synthesizes the repair.
    const synthesizer = state.active[0]!;
    const revisedCandidate = parseCandidateConsensus(
      await askMember(
        synthesizer,
        buildSynthesisMessages(prompt, candidateConsensus, ratifications, synthesizer),
        state,
        "synthesis",
        null,
      ),
    );
    if (revisedCandidate.length > 0 && candidateChanged(candidateConsensus, revisedCandidate)) {
      repair = {
        priorRatifications: ratifications,
        revisedCandidate,
        synthesizedBy: toMemberRef(synthesizer),
      };
      ratifications = await ratifyCandidate(state, prompt, rounds, revisedCandidate);
      candidateConsensus = revisedCandidate;
    }
  }

  const result: ModelCouncilResult = {
    prompt,
    members,
    responses,
    deliberations,
    rounds,
    candidateConsensus,
    converged,
    ratifications,
    repair,
    consensus: buildConsensusResult(ratifications, state.active),
    degraded: state.dropped.length > 0,
    droppedMembers: state.dropped,
    ledger: state.ledger,
    ledgerTotals: aggregateLedger(state.ledger),
  };
  // WU-B2: the run completed — the checkpoint's crash insurance is no longer
  // needed, so remove it. (A thrown failure above leaves it in place for the
  // failure record to reconstruct from.)
  await finalizePartial(state);
  return result;
}

// Ratify a single candidate artifact: every member independently votes
// ACCEPT/BLOCK after reading the latest peer positions. Shared by the first
// ratify round and the post-repair re-ratify so both use one implementation.
async function ratifyCandidate(
  state: CouncilRunState,
  prompt: string,
  rounds: ModelCouncilRound[],
  candidateConsensus: string,
): Promise<ModelCouncilRatification[]> {
  // WU-B3: unanimity is over survivors only — a member that fails to vote is
  // dropped, and the run fails only if fewer than two survive. Each survivor's
  // vote is checkpointed as it lands.
  const results = await runMemberPhase(
    state,
    "ratification",
    null,
    async (member) => {
      const content = await askMember(
        member,
        buildRatificationMessages(prompt, rounds, candidateConsensus, member),
        state,
        "ratification",
        null,
      );
      const vote = parseRatificationVote(content);
      const ratification: ModelCouncilRatification = {
        member: toMemberRef(member),
        content,
        accepted: vote.decision === "accept",
        vote,
      };
      return ratification;
    },
    (ratification) => ({ votes: ratification.vote }),
  );
  return state.active.map((member) => results.get(member)!);
}

// --- WU-B2/B3/B4/B5 run orchestration ---------------------------------------
//
// A per-run accumulator: the shrinking survivor roster, the terminal-drop log, the
// cost/latency ledger, the crash-insurance checkpoint path, and the resolved
// per-member timeout. Threaded through every phase.
type CouncilRunState = {
  prompt: string;
  members: ModelCouncilMember[];
  active: ModelCouncilMember[];
  dropped: CouncilDroppedMember[];
  ledger: CouncilLedgerEntry[];
  partialPath: string;
  timeoutMs: number;
};

async function createRunState(prompt: string, members: ModelCouncilMember[]): Promise<CouncilRunState> {
  const dir = resolveDeliberationsDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  // A pid+random suffix keeps concurrent runs from colliding on one checkpoint
  // path (the reconstructor globs `*.partial.jsonl`, so the exact name is free).
  const suffix = `${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
  const partialPath = path.join(dir, `council-${timestamp}-${suffix}.partial.jsonl`);
  // Create the checkpoint up front (best-effort) so the mid-run existence check is
  // deterministic and a crash before the first phase still leaves a marker.
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(partialPath, "", { flag: "w" });
  } catch {
    // Checkpointing is best-effort crash insurance — never fail the run over it.
  }
  return {
    prompt,
    members,
    active: [...members],
    dropped: [],
    ledger: [],
    partialPath,
    timeoutMs: resolveMemberTimeoutMs(),
  };
}

// WU-B3: run one phase over the surviving roster with Promise.allSettled. Each
// survivor's result is checkpointed as it lands; a member that rejects is dropped
// with its reason. The phase throws — losing quorum — only when a drop leaves
// fewer than two survivors; a full-roster success (even a deliberately single-
// member council) never trips the quorum guard.
async function runMemberPhase<T>(
  state: CouncilRunState,
  phase: string,
  round: number | null,
  call: (member: ModelCouncilMember) => Promise<T>,
  toCheckpointPayload?: (value: T) => { content?: string; votes?: RatificationVote },
): Promise<Map<ModelCouncilMember, T>> {
  const attempted = [...state.active];
  const settled = await Promise.allSettled(attempted.map((member) => call(member)));
  const results = new Map<ModelCouncilMember, T>();
  let droppedThisPhase = 0;
  for (let i = 0; i < attempted.length; i++) {
    const member = attempted[i]!;
    const outcome = settled[i]!;
    if (outcome.status === "fulfilled") {
      results.set(member, outcome.value);
      const payload = toCheckpointPayload
        ? toCheckpointPayload(outcome.value)
        : { content: typeof outcome.value === "string" ? outcome.value : undefined };
      await appendPartialLine(state, {
        phase,
        round,
        member: member.name,
        timestamp: new Date().toISOString(),
        ...payload,
      });
    } else {
      const reason = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
      dropMember(state, member, phase, round, reason);
      droppedThisPhase += 1;
      await appendPartialLine(state, {
        phase,
        round,
        member: member.name,
        id: member.id,
        timestamp: new Date().toISOString(),
        reason,
      });
    }
  }
  if (droppedThisPhase > 0 && state.active.length < 2) {
    throw quorumError(state, phase);
  }
  return results;
}

// WU-B3: remove a member from the surviving roster and log the terminal drop.
function dropMember(
  state: CouncilRunState,
  member: ModelCouncilMember,
  phase: string,
  round: number | null,
  reason: string,
): void {
  const index = state.active.indexOf(member);
  if (index >= 0) {
    state.active.splice(index, 1);
  }
  state.dropped.push({ id: member.id, phase, round, reason });
}

function memberNameFromId(members: ModelCouncilMember[], id: string): string {
  return members.find((member) => member.id === id)?.name ?? id;
}

// WU-B3: the run lost quorum (fewer than two survivors after a drop). The message
// names the survivors and every dropped member with its phase and reason, so a
// single-member timeout surfaces "timed out after <ms>ms" all the way up.
function quorumError(state: CouncilRunState, phase: string): Error {
  const survivors = state.active.map((member) => member.name).join(", ") || "none";
  const dropped = state.dropped
    .map(
      (drop) =>
        `${memberNameFromId(state.members, drop.id)} [${drop.phase}${drop.round !== null ? ` r${drop.round}` : ""}]: ${drop.reason}`,
    )
    .join("; ");
  return new Error(
    `Council lost quorum during ${phase}: ${state.active.length} of ${state.members.length} members survived (survivors: ${survivors}; dropped: ${dropped}).`,
  );
}

// WU-B2: append one crash-insurance line. Best-effort — a checkpoint IO failure
// never fails the run.
async function appendPartialLine(state: CouncilRunState, record: PartialPhaseRecord): Promise<void> {
  try {
    await appendFile(state.partialPath, `${JSON.stringify(record)}\n`, "utf8");
  } catch {
    // best-effort crash insurance
  }
}

// WU-B2: the run completed — the checkpoint's crash insurance is no longer needed.
async function finalizePartial(state: CouncilRunState): Promise<void> {
  await rm(state.partialPath, { force: true }).catch(() => {});
}

// WU-B4: fold the per-call ledger into aggregate totals. Token totals stay null
// unless at least one call reported the corresponding figure.
function aggregateLedger(ledger: CouncilLedgerEntry[]): CouncilLedgerTotals {
  const totals: CouncilLedgerTotals = {
    calls: ledger.length,
    wallMs: 0,
    promptChars: 0,
    responseChars: 0,
    promptTokens: null,
    completionTokens: null,
    totalTokens: null,
  };
  for (const entry of ledger) {
    totals.wallMs += entry.wallMs;
    totals.promptChars += entry.promptChars;
    totals.responseChars += entry.responseChars;
    if (entry.usage) {
      if (entry.usage.promptTokens !== null) {
        totals.promptTokens = (totals.promptTokens ?? 0) + entry.usage.promptTokens;
      }
      if (entry.usage.completionTokens !== null) {
        totals.completionTokens = (totals.completionTokens ?? 0) + entry.usage.completionTokens;
      }
      if (entry.usage.totalTokens !== null) {
        totals.totalTokens = (totals.totalTokens ?? 0) + entry.usage.totalTokens;
      }
    }
  }
  return totals;
}

// WU-B5: estimate prompt tokens as chars/4 — deliberately crude; the precheck is
// advisory only.
function estimateTokens(chars: number): number {
  return Math.ceil(chars / 4);
}

function memberContextBudget(member: ModelCouncilMember): number {
  const override = readEnv(`${CONTEXT_TOKENS_ENV_PREFIX}${member.id.toUpperCase()}`);
  if (override) {
    const parsed = Number.parseInt(override, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_MEMBER_CONTEXT_TOKENS[member.id];
}

// WU-B5: before any spend, estimate each member's round-0 brief against its context
// budget. Over budget -> a loud stderr warning naming the member. Under
// AGENTS_COUNCIL_DROP_OVERSIZED=1 the oversized seat is additionally dropped
// pre-spend (via the WU-B3 machinery, so the quorum guard still applies). Advisory
// by default: an over-budget estimate never hard-fails the run.
async function briefSizePrecheck(state: CouncilRunState, evidencePack: EvidencePackEntry[] | undefined): Promise<void> {
  const dropRaw = readEnv(DROP_OVERSIZED_ENV);
  const dropOversized = dropRaw === "1" || dropRaw?.toLowerCase() === "true";
  const droppedForOversize: { member: ModelCouncilMember; reason: string }[] = [];
  for (const member of [...state.active]) {
    const messages = buildProposalMessages(state.prompt, member, evidencePack);
    const chars = messages.reduce((total, message) => total + flattenMessageContent(message.content).length, 0);
    const estimate = estimateTokens(chars);
    const budget = memberContextBudget(member);
    if (estimate <= budget) {
      continue;
    }
    const reason = `oversized round-0 brief: estimated ${estimate} tokens exceeds the ${budget}-token context budget`;
    process.stderr.write(
      `WARNING: council member ${member.name} (${member.id}) has an ${reason}${
        dropOversized
          ? " — dropping the seat pre-spend (AGENTS_COUNCIL_DROP_OVERSIZED=1)."
          : " (advisory only; set AGENTS_COUNCIL_DROP_OVERSIZED=1 to drop it)."
      }\n`,
    );
    if (dropOversized) {
      dropMember(state, member, "precheck", null, reason);
      droppedForOversize.push({ member, reason });
    }
  }
  for (const { member, reason } of droppedForOversize) {
    await appendPartialLine(state, {
      phase: "precheck",
      round: null,
      member: member.name,
      id: member.id,
      timestamp: new Date().toISOString(),
      reason,
    });
  }
  if (droppedForOversize.length > 0 && state.active.length < 2) {
    throw quorumError(state, "precheck");
  }
}

// FACTUAL_ERROR and MATERIAL_DISAGREEMENT are absolute vetoes (F7): unlike a
// repairable objection (INSUFFICIENT_EVIDENCE, SYNTHESIS_ERROR, or a bare BLOCK),
// they cannot be resolved by folding in edits — no rewrite makes a false claim true
// or dissolves a genuine substantive split — so they end the council at "blocked".
const ABSOLUTE_VETO_KINDS: readonly RatificationBlockKind[] = ["FACTUAL_ERROR", "MATERIAL_DISAGREEMENT"];

function isAbsoluteVeto(ratification: ModelCouncilRatification): boolean {
  return (
    ratification.vote.decision === "block" &&
    ratification.vote.blockKind !== undefined &&
    ABSOLUTE_VETO_KINDS.includes(ratification.vote.blockKind)
  );
}

// True when ratification ran and at least one member withheld acceptance. Such a
// block is frequently conditional ("ACCEPT after these edits") rather than a hard
// veto, so it is worth one synthesis-and-re-ratify repair cycle before recording
// "blocked". An absolute veto (F7) is the exception: it overrides any
// ACCEPT_WITH_EDITS and skips repair, because synthesis cannot clear it.
export function shouldAttemptRepair(ratifications: ModelCouncilRatification[]): boolean {
  if (ratifications.length === 0) {
    return false;
  }
  if (ratifications.some(isAbsoluteVeto)) {
    return false;
  }
  return ratifications.some((ratification) => !ratification.accepted);
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
    result.consensus.outcome === "ratified"
      ? "# Council Consensus"
      : result.consensus.outcome === "blocked"
        ? "# Council Consensus Blocked"
        : "# Council Consensus Not Reached",
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
    `- Degraded (member dropped mid-run): ${result.degraded ? "yes" : "no"}`,
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

  // WU-B3: surface any member dropped mid-run and why — the consensus was reached
  // over the survivors only.
  if (result.droppedMembers && result.droppedMembers.length > 0) {
    lines.push(
      "",
      "## Dropped Members",
      "",
      "The following members were dropped mid-run; consensus was computed over the survivors only.",
      "",
      "| Member | Phase | Round | Reason |",
      "| ------ | ----- | ----- | ------ |",
      ...result.droppedMembers.map(
        (drop) =>
          `| ${memberNameFromId(result.members, drop.id)} | ${drop.phase} | ${drop.round ?? "—"} | ${drop.reason.replace(/\|/g, "\\|")} |`,
      ),
    );
  }

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

  // Minority report (WU-B4): a first-class, consolidated record of the blocking
  // dissents, rendered only on a `blocked` outcome so the minority's objections —
  // including a WU-B2 claim-ledger FACTUAL_ERROR precondition — are never dropped.
  const minorityReport = result.consensus.minorityReport;
  if (result.consensus.outcome === "blocked" && minorityReport && minorityReport.length > 0) {
    lines.push("", "## Minority Report");
    for (const entry of minorityReport) {
      const kind = entry.blockKind ? `${entry.blockKind}${entry.absolute ? " (absolute veto)" : ""}` : "BLOCK";
      lines.push("", `### ${entry.member} — ${kind}`, "", entry.dissent);
    }
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

  // WU-B4: a short cost/latency totals table (per member+provider, plus a total
  // row). Pure observation — nothing above reads the ledger.
  if (result.ledger && result.ledger.length > 0 && result.ledgerTotals) {
    const totals = result.ledgerTotals;
    const byMember = new Map<
      string,
      {
        member: string;
        provider: string;
        calls: number;
        wallMs: number;
        promptChars: number;
        responseChars: number;
        promptTokens: number | null;
        completionTokens: number | null;
      }
    >();
    for (const entry of result.ledger) {
      const key = `${entry.member} ${entry.provider}`;
      const row = byMember.get(key) ?? {
        member: entry.member,
        provider: entry.provider,
        calls: 0,
        wallMs: 0,
        promptChars: 0,
        responseChars: 0,
        promptTokens: null,
        completionTokens: null,
      };
      row.calls += 1;
      row.wallMs += entry.wallMs;
      row.promptChars += entry.promptChars;
      row.responseChars += entry.responseChars;
      if (entry.usage?.promptTokens != null) {
        row.promptTokens = (row.promptTokens ?? 0) + entry.usage.promptTokens;
      }
      if (entry.usage?.completionTokens != null) {
        row.completionTokens = (row.completionTokens ?? 0) + entry.usage.completionTokens;
      }
      byMember.set(key, row);
    }
    lines.push(
      "",
      "## Cost & Latency Ledger",
      "",
      `${totals.calls} provider call(s) · ${totals.wallMs} ms wall time · ${totals.promptChars} prompt chars · ${totals.responseChars} response chars.`,
      "",
      "| Member | Provider | Calls | Wall ms | Prompt chars | Response chars | Prompt tok | Completion tok |",
      "| ------ | -------- | ----- | ------- | ------------ | -------------- | ---------- | -------------- |",
      ...[...byMember.values()].map(
        (row) =>
          `| ${row.member} | ${row.provider} | ${row.calls} | ${row.wallMs} | ${row.promptChars} | ${row.responseChars} | ${row.promptTokens ?? "—"} | ${row.completionTokens ?? "—"} |`,
      ),
      `| **Total** | | ${totals.calls} | ${totals.wallMs} | ${totals.promptChars} | ${totals.responseChars} | ${totals.promptTokens ?? "—"} | ${totals.completionTokens ?? "—"} |`,
    );
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
  // INV-2: the structured trace (WU-B5) and the observational issue map (WU-B6)
  // are written ONLY under AGENTS_COUNCIL_STRUCTURED. Flag OFF, the two writes
  // above are the byte-for-byte legacy output and nothing below executes — no
  // trace file, no issue-map file, no schema-module import.
  if (isStructuredCouncilEnabled()) {
    const claims = await extractStructuredClaims(result);
    // WU-B5: per-claim / per-member / per-round structured trace + outcome,
    // alongside council-{ts}.json/.md. Equal member weights — never by prestige.
    const tracePath = path.join(deliberationsDir, `trace-${timestamp}.json`);
    await writeFile(tracePath, `${JSON.stringify(buildStructuredTrace(result, claims), null, 2)}\n`, "utf8");
    // WU-B6: observational, non-controlling issue map (INV-3) — deterministic
    // exact-match clustering of the schema-validated claims (INV-5).
    const { buildIssueMap } = await import("./council/issueMap");
    const issueMapPath = path.join(deliberationsDir, `issue-map-${timestamp}.json`);
    await writeFile(issueMapPath, `${JSON.stringify(buildIssueMap(claims.map(toIssueMapClaim)), null, 2)}\n`, "utf8");
  }
  return { jsonPath, markdownPath };
}

// --- Structured artifact extraction — WU-B5 / WU-B6 ------------------------
//
// One schema-validated claim, projected from a member's structured payload in a
// specific round. Equal member weight is intrinsic: a claim is attributed to its
// proposing member and never carries a prestige weight (WU-B5 invariant).
type StructuredClaim = {
  round: number;
  member: string;
  claimId: string;
  text: string;
  provenance: string;
  evidence: string[];
};

// Project a StructuredClaim to the issue-map input shape (WU-B6). Round is
// dropped — clustering corroborates a statement across MEMBERS, regardless of
// which round each member asserted it in.
function toIssueMapClaim(claim: StructuredClaim): import("./council/issueMap").IssueMapClaim {
  return { member: claim.member, claimId: claim.claimId, text: claim.text, provenance: claim.provenance };
}

// Extract every schema-validated claim from a result's rounds. Under the flag
// only (caller gates on isStructuredCouncilEnabled): each proposal is parsed via
// the WU-B1 guarded dynamic import; a member that emitted legacy text (not a
// structured payload with `claims`) contributes nothing — best-effort in Wave B,
// never throws. Deterministic over the persisted result. Returns claims in
// (round, member, claim) input order. INV-5: pure parse, no LLM/network.
async function extractStructuredClaims(result: ModelCouncilResult): Promise<StructuredClaim[]> {
  const { parseStructuredOrFallback, DeliberationResponseSchema } = await import("./council/schemas");
  const out: StructuredClaim[] = [];
  for (const round of result.rounds) {
    for (const proposal of round.proposals) {
      const parsed = parseStructuredOrFallback(proposal.content, DeliberationResponseSchema, () => null);
      if (parsed === null || typeof parsed === "string" || !("claims" in parsed)) {
        continue;
      }
      for (const claim of parsed.claims) {
        out.push({
          round: round.index,
          member: proposal.member.name,
          claimId: claim.id,
          text: claim.text,
          provenance: claim.provenance,
          evidence: claim.evidence,
        });
      }
    }
  }
  return out;
}

// Build the per-claim / per-member / per-round structured trace (WU-B5). The
// top-level skeleton (prompt, members{id,name,provider,model}, consensus, rounds,
// converged, candidateConsensus) matches the council_to_brief.py contract
// (deliberations/*.json) so the external consumer parses a trace file identically
// to a council-{ts}.json; the additive `claims` array carries the structured
// per-claim/per-member/per-round detail. Equal member weight: every member entry
// carries weight 1 and no field weights any member by prestige.
function buildStructuredTrace(
  result: ModelCouncilResult,
  claims: StructuredClaim[],
): {
  schema_version: "agents-council.council_trace.v1";
  prompt: string;
  members: (ModelCouncilMember & { weight: number })[];
  rounds: { index: number; changed: boolean; memberAgreement: number }[];
  consensus: ModelCouncilConsensus;
  converged: boolean;
  candidateConsensus: string;
  claims: StructuredClaim[];
} {
  return {
    schema_version: "agents-council.council_trace.v1",
    prompt: result.prompt,
    // Equal member weights — never weight by prestige (WU-B5 invariant).
    members: result.members.map((member) => ({ ...member, weight: 1 })),
    rounds: result.rounds.map((round) => ({
      index: round.index,
      changed: round.changed,
      memberAgreement: round.memberAgreement,
    })),
    consensus: result.consensus,
    converged: result.converged,
    candidateConsensus: result.candidateConsensus,
    claims,
  };
}

// WU-B2: a failed run must not lose completed work. The enriched failure record
// persists every proposal / deliberation round / partial ratification that landed
// before the abort. The completed work comes from either an explicitly supplied
// snapshot or — the CLI/MCP path, where only {prompt, error} is available — the
// crash-insurance checkpoint runModelCouncil left behind, which is read and then
// consumed here.
export async function saveModelCouncilFailure(input: {
  prompt: string;
  error: string;
  partial?: CouncilPartialSnapshot;
}): Promise<{
  jsonPath: string;
  markdownPath: string;
}> {
  const deliberationsDir = resolveDeliberationsDir();
  await mkdir(deliberationsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = path.join(deliberationsDir, `council-failed-${timestamp}.json`);
  const markdownPath = path.join(deliberationsDir, `council-failed-${timestamp}.md`);
  const salvaged = input.partial ?? (await reconstructPartial(deliberationsDir));
  const failure: ModelCouncilFailure = {
    schema_version: "agents-council.model_council_failure.v1",
    generatedAt: new Date().toISOString(),
    prompt: input.prompt,
    error: input.error,
    members: buildDefaultMembers(),
    ...(salvaged && salvaged.completedPhases.length > 0 ? { completedPhases: salvaged.completedPhases } : {}),
    ...(salvaged && salvaged.droppedMembers.length > 0 ? { droppedMembers: salvaged.droppedMembers } : {}),
  };
  await writeFile(jsonPath, `${JSON.stringify(failure, null, 2)}\n`, "utf8");
  await writeFile(markdownPath, formatModelCouncilFailureMarkdown(failure), "utf8");
  return { jsonPath, markdownPath };
}

// WU-B2: read the newest leftover partial checkpoint (the one runModelCouncil left
// on failure), split it into completed phases and drops, and consume the file so it
// is not folded into a later failure record. Best-effort — missing/unreadable
// checkpoints yield null.
async function reconstructPartial(dir: string): Promise<CouncilPartialSnapshot | null> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return null;
  }
  const partials = entries.filter((name) => name.endsWith(".partial.jsonl"));
  if (partials.length === 0) {
    return null;
  }
  let newest: { file: string; mtimeMs: number } | null = null;
  for (const file of partials) {
    try {
      const info = await stat(path.join(dir, file));
      if (!newest || info.mtimeMs > newest.mtimeMs) {
        newest = { file, mtimeMs: info.mtimeMs };
      }
    } catch {
      // skip an entry that vanished between readdir and stat
    }
  }
  if (!newest) {
    return null;
  }
  const fullPath = path.join(dir, newest.file);
  let text: string;
  try {
    text = await readFile(fullPath, "utf8");
  } catch {
    return null;
  }
  const completedPhases: PartialPhaseRecord[] = [];
  const droppedMembers: CouncilDroppedMember[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    let record: PartialPhaseRecord;
    try {
      record = JSON.parse(trimmed) as PartialPhaseRecord;
    } catch {
      continue;
    }
    if (record.reason !== undefined && record.content === undefined && record.votes === undefined) {
      droppedMembers.push({
        id: (record.id ?? "") as ModelCouncilMember["id"],
        phase: record.phase,
        round: record.round ?? null,
        reason: record.reason,
      });
    } else {
      completedPhases.push(record);
    }
  }
  await rm(fullPath, { force: true }).catch(() => {});
  return { completedPhases, droppedMembers };
}

function formatModelCouncilFailureMarkdown(failure: ModelCouncilFailure): string {
  const lines: string[] = [
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
  ];
  // WU-B3: clearly show any member dropped before the abort, and why.
  if (failure.droppedMembers && failure.droppedMembers.length > 0) {
    lines.push("", "## Dropped Members", "");
    for (const drop of failure.droppedMembers) {
      const name = memberNameFromId(failure.members, drop.id);
      lines.push(`- **${name}** — ${drop.phase}${drop.round !== null ? ` (round ${drop.round})` : ""}: ${drop.reason}`);
    }
  }
  // WU-B2: the salvaged completed work, so a failed run never silently loses it.
  if (failure.completedPhases && failure.completedPhases.length > 0) {
    lines.push(
      "",
      "## Completed Work (salvaged)",
      "",
      `${failure.completedPhases.length} completed member call(s) were recovered from the run checkpoint before the failure:`,
      "",
    );
    for (const record of failure.completedPhases) {
      const label = `${record.member ?? "(unknown)"} — ${record.phase}${record.round !== null ? ` (round ${record.round})` : ""}`;
      const body = record.content ?? (record.votes ? `vote: ${record.votes.decision}` : "(no payload)");
      lines.push(`### ${label}`, "", body, "");
    }
  }
  lines.push("");
  return lines.join("\n");
}

function validateCouncilConfig(members: ModelCouncilMember[]): void {
  if (members.some((member) => member.provider === "openrouter") && !readEnv("OPENROUTER_API_KEY")) {
    throw new Error("OPENROUTER_API_KEY is required for the Kimi and DeepSeek council members.");
  }
  if (members.some((member) => member.provider === "moonshot") && !readEnv(MOONSHOT_API_KEY_ENV)) {
    throw new Error(`${MOONSHOT_API_KEY_ENV} is required for direct Moonshot/Kimi council members.`);
  }
  if (members.some((member) => member.provider === "deepseek") && !readEnv(DEEPSEEK_API_KEY_ENV)) {
    throw new Error(`${DEEPSEEK_API_KEY_ENV} is required for direct DeepSeek council members.`);
  }
  // Gemini CLI presence is checked lazily inside askGemini — the executable
  // resolution mirrors getCodexExecutablePath() and lets the error fire with
  // install instructions only when a Gemini member actually runs.
}

export function buildDefaultMembers(): ModelCouncilMember[] {
  const directVendorKeys = useDirectVendorKeys();
  const members: ModelCouncilMember[] = [
    {
      id: "kimi",
      name: "Kimi K2.6",
      provider: directVendorKeys ? "moonshot" : "openrouter",
      model:
        readEnv("AGENTS_COUNCIL_KIMI_MODEL") ?? (directVendorKeys ? DEFAULT_DIRECT_KIMI_MODEL : DEFAULT_KIMI_MODEL),
    },
    {
      id: "deepseek",
      name: "DeepSeek V4 Pro",
      provider: directVendorKeys ? "deepseek" : "openrouter",
      model:
        readEnv("AGENTS_COUNCIL_DEEPSEEK_MODEL") ??
        (directVendorKeys ? DEFAULT_DIRECT_DEEPSEEK_MODEL : DEFAULT_DEEPSEEK_MODEL),
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
      name: "Opus 4.8",
      provider: "claude",
      model: readEnv("AGENTS_COUNCIL_CLAUDE_MODEL") ?? DEFAULT_CLAUDE_MODEL,
    },
  ];
  return selectConfiguredMembers(members);
}

function selectConfiguredMembers(members: ModelCouncilMember[]): ModelCouncilMember[] {
  const orderedByIds = (ids: readonly string[]): ModelCouncilMember[] =>
    ids
      .map((id) => members.find((member) => member.id === id || member.name.toLowerCase() === id))
      .filter((member): member is ModelCouncilMember => member !== undefined);

  const raw = readEnv(MEMBERS_ENV);
  const requested = (raw ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  // No override → the two-member Opus 4.8 + GPT-5.5 (xhigh) default roster.
  if (requested.length === 0) {
    return orderedByIds(DEFAULT_MEMBER_IDS);
  }

  // Override path: select in the order the caller listed them, so the first
  // listed member chairs synthesis (members[0]).
  const selected = orderedByIds(requested);
  if (selected.length === 0) {
    throw new Error(`${MEMBERS_ENV} did not match any council members: ${raw}`);
  }
  return selected;
}

// A provider reply: the text plus any usage the provider reported. Usage is null
// on the paths that report none (Gemini CLI, the injected test asker).
type MemberReply = { content: string; usage: CouncilTokenUsage | null };

// WU-B1 test seam. Production never sets this — the setter is called only from the
// test suite. When set, member calls route to it INSTEAD of the real provider
// dispatch, still wrapped in the same per-member timeout, ledger, and checkpoint
// machinery, so degradation / timeout / checkpoint / ledger behavior can be driven
// deterministically without real provider CLIs (the "dependency-injected asker"
// seam named in the lane contract).
export type TestMemberAsker = (
  member: ModelCouncilMember,
  messages: ChatMessage[],
  phase: string,
  round: number | null,
) => Promise<string>;
let testMemberAsker: TestMemberAsker | null = null;
export function __setTestMemberAsker(asker: TestMemberAsker | null): void {
  testMemberAsker = asker;
}

// Per-call latency instrumentation, gated on AGENTS_COUNCIL_PERF_LOG. Pure
// observability: logs to stderr only and never alters the prompt, control flow,
// or return value. Since WU-B4 the same timing feeds the cost/latency ledger,
// which is recorded on every successful call regardless of the flag.
let perfBaseMs = 0;
async function askMember(
  member: ModelCouncilMember,
  messages: ChatMessage[],
  state: CouncilRunState,
  phase: string,
  round: number | null,
): Promise<string> {
  const promptChars = messages.reduce((total, message) => total + flattenMessageContent(message.content).length, 0);
  const startMs = Date.now();
  if (perfBaseMs === 0) {
    perfBaseMs = startMs;
  }
  let reply: MemberReply | undefined;
  try {
    reply = await produceReply(member, messages, state.timeoutMs, phase, round);
    return reply.content;
  } finally {
    const endMs = Date.now();
    if (readEnv("AGENTS_COUNCIL_PERF_LOG")) {
      process.stderr.write(
        `PERF member=${member.name} provider=${member.provider} startMs=${startMs - perfBaseMs} endMs=${endMs - perfBaseMs} durMs=${endMs - startMs}\n`,
      );
    }
    if (reply) {
      // WU-B4: one ledger row per SUCCESSFUL call (a failed call produced no
      // response to account for; its cost surfaces as a WU-B3 drop instead).
      state.ledger.push({
        member: member.name,
        provider: member.provider,
        phase,
        round,
        wallMs: endMs - startMs,
        promptChars,
        responseChars: reply.content.length,
        usage: reply.usage,
      });
    }
  }
}

// Route one member call to its provider (or the injected test asker), applying the
// WU-B1 per-member timeout where the provider lacks its own. The HTTP providers
// (openrouter/moonshot/deepseek) already time out via the curl shim's `--max-time`
// (driven by the same resolveMemberTimeoutMs), so they are not double-wrapped; the
// SDK/CLI providers — which previously had NO timeout — and the injected asker are
// wrapped in withMemberTimeout, which aborts the in-flight SDK call / kills the
// subprocess so the loser cannot keep the process alive.
async function produceReply(
  member: ModelCouncilMember,
  messages: ChatMessage[],
  timeoutMs: number,
  phase: string,
  round: number | null,
): Promise<MemberReply> {
  if (testMemberAsker) {
    const asker = testMemberAsker;
    return withMemberTimeout(member, timeoutMs, async () => ({
      content: await asker(member, messages, phase, round),
      usage: null,
    }));
  }
  if (member.provider === "openrouter") {
    return askOpenRouter(member, messages);
  }
  if (member.provider === "moonshot") {
    return askDirectChatProvider(member, messages, {
      label: "Moonshot",
      apiKeyEnv: MOONSHOT_API_KEY_ENV,
      urlEnv: MOONSHOT_URL_ENV,
      defaultUrl: MOONSHOT_CHAT_COMPLETIONS_URL,
    });
  }
  if (member.provider === "deepseek") {
    return askDirectChatProvider(member, messages, {
      label: "DeepSeek",
      apiKeyEnv: DEEPSEEK_API_KEY_ENV,
      urlEnv: DEEPSEEK_URL_ENV,
      defaultUrl: DEEPSEEK_CHAT_COMPLETIONS_URL,
    });
  }
  if (member.provider === "gemini") {
    return withMemberTimeout(member, timeoutMs, (signal) => askGemini(member, messages, signal));
  }
  if (member.provider === "claude") {
    return withMemberTimeout(member, timeoutMs, (signal) => askClaude(member, messages, signal));
  }
  return withMemberTimeout(member, timeoutMs, (signal) => askCodex(member, messages, signal));
}

// WU-B1: race a member call against a real timeout. On timeout the AbortController
// is tripped (so the wrapped provider can cancel its SDK call or kill its
// subprocess) and the promise rejects with an error naming the member, provider,
// and elapsed budget. Exported so the timeout contract is unit-testable without a
// real provider.
export async function withMemberTimeout<T>(
  member: ModelCouncilMember,
  timeoutMs: number,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`${member.name} (${member.provider}) timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([run(controller.signal), timeout]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

// WU-B1: the per-member timeout governing EVERY provider. Precedence:
// AGENTS_COUNCIL_MEMBER_TIMEOUT_MS > AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS (legacy
// alias) > the 300s default. Exported so the precedence is directly testable.
export function resolveMemberTimeoutMs(): number {
  const raw = readEnv(MEMBER_TIMEOUT_ENV) ?? readEnv(OPENROUTER_TIMEOUT_ENV);
  if (!raw) {
    return DEFAULT_OPENROUTER_TIMEOUT_MS;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < MIN_OPENROUTER_TIMEOUT_MS) {
    return DEFAULT_OPENROUTER_TIMEOUT_MS;
  }
  return parsed;
}

// WU-B4: normalize a provider's usage object across vendor field names into the
// council's {promptTokens, completionTokens, totalTokens} shape. Returns null when
// no recognizable token counts are present.
function toTokenUsage(raw: unknown): CouncilTokenUsage | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const num = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);
  const promptTokens = num(record.prompt_tokens) ?? num(record.input_tokens);
  const completionTokens = num(record.completion_tokens) ?? num(record.output_tokens);
  const totalTokens =
    num(record.total_tokens) ??
    (promptTokens !== null && completionTokens !== null ? promptTokens + completionTokens : null);
  if (promptTokens === null && completionTokens === null && totalTokens === null) {
    return null;
  }
  return { promptTokens, completionTokens, totalTokens };
}

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const OPENROUTER_MAX_ATTEMPTS = 3;

type DirectChatProviderConfig = {
  label: string;
  apiKeyEnv: string;
  urlEnv: string;
  defaultUrl: string;
};

async function askOpenRouter(member: ModelCouncilMember, messages: ChatMessage[]): Promise<MemberReply> {
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
  // WU-B1: the curl shim's `--max-time` is the OpenRouter timeout; it now honors
  // the unified member-timeout env (with the OpenRouter alias) like every provider.
  const timeoutMs = resolveMemberTimeoutMs();
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
      return { content: text, usage: toTokenUsage(body?.usage) };
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

async function askDirectChatProvider(
  member: ModelCouncilMember,
  messages: ChatMessage[],
  config: DirectChatProviderConfig,
): Promise<MemberReply> {
  const apiKey = readEnv(config.apiKeyEnv);
  if (!apiKey) {
    throw new Error(`${config.apiKeyEnv} is required for ${member.name}.`);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  const requestBody = JSON.stringify({ model: member.model, messages });
  // WU-B1: unified member timeout (with the OpenRouter alias) governs the curl
  // shim's `--max-time` for the direct vendor providers too.
  const timeoutMs = resolveMemberTimeoutMs();
  const url = readEnv(config.urlEnv) ?? config.defaultUrl;

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
      throw new Error(
        `${member.name} ${config.label} request failed after ${OPENROUTER_MAX_ATTEMPTS} attempts: ${detail}`,
      );
    }

    let body: OpenRouterResponse | null = null;
    try {
      body = rawText ? (JSON.parse(rawText) as OpenRouterResponse) : null;
    } catch {
      body = null;
    }

    if (!response.ok) {
      const detail = body?.error?.message ?? `${response.status} ${response.statusText}`;
      if ((response.status === 429 || response.status >= 500) && attempt < OPENROUTER_MAX_ATTEMPTS) {
        lastReason = detail;
        await delay(attempt * 500);
        continue;
      }
      throw new Error(`${member.name} ${config.label} request failed: ${detail}`);
    }

    const choice = body?.choices?.[0];
    const text = extractOpenRouterText(choice);
    if (text) {
      return { content: text, usage: toTokenUsage(body?.usage) };
    }

    const finishReason = choice?.finish_reason ? `finish_reason=${choice.finish_reason}` : null;
    const errorDetail = choice?.error?.message ?? body?.error?.message ?? null;
    lastReason = [finishReason, errorDetail].filter(Boolean).join("; ") || "no content/reasoning returned";
    if (attempt < OPENROUTER_MAX_ATTEMPTS) {
      await delay(attempt * 500);
      continue;
    }
    const snippet = (rawText.trim().length > 0 ? rawText : "<empty body>").slice(0, 500);
    throw new Error(
      `${member.name} ${config.label} returned an empty response after ${OPENROUTER_MAX_ATTEMPTS} attempts (${lastReason}). Raw: ${snippet}`,
    );
  }

  throw new Error(`${member.name} ${config.label} request failed (${lastReason}).`);
}

// Bun 1.3.11's fetch() hangs on long-running OpenRouter responses to reasoning
// models (Kimi K2.6 etc.) — the Promise never resolves even though headers
// arrive within ~2s. Diagnosed 2026-05-28: same body via curl from the same
// Bun process completes in ~150s; Bun fetch hangs past 300s. Until Bun's HTTP
// client fixes this, route OpenRouter calls through curl. Inputs/outputs match
// the original fetch wrapper exactly so the caller (askOpenRouter) is unchanged.
export async function fetchTextWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<{ response: Response; rawText: string }> {
  const STATUS_SENTINEL = "\n__BUN_CURL_HTTP_STATUS__:";
  // Headers (including `Authorization: Bearer <key>`) are written to a 0600
  // temp curl config file and passed via `--config`, never as `-H` argv
  // elements. This keeps the API key out of the spawned process argv, which is
  // world-readable via `ps` / `/proc/<pid>/cmdline` (INV-1 / gate_no_bearer).
  // stdin stays reserved for the POST body (`--data-binary @-`), so the config
  // cannot ride on `-K -`; a temp file is used and unlinked after the process
  // exits (curl has already read it by then).
  const headersInit = init.headers as Record<string, string> | undefined;
  const configLines: string[] = [];
  if (headersInit) {
    for (const [key, value] of Object.entries(headersInit)) {
      // curl config syntax: `header = "Key: Value"`. Escape backslashes and
      // double-quotes so a header value can never break out of the quoted form.
      const headerValue = `${key}: ${value}`.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      configLines.push(`header = "${headerValue}"`);
    }
  }

  let configPath: string | null = null;
  if (configLines.length > 0) {
    configPath = path.join(
      tmpdir(),
      `agents-council-curl-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.cfg`,
    );
    // flag "wx" = O_CREAT|O_EXCL: fail closed if the path already exists or is a
    // symlink, closing the predictable-name TOCTOU / symlink-swap window in the
    // shared tmpdir before the bearer token is written.
    await writeFile(configPath, `${configLines.join("\n")}\n`, { mode: 0o600, flag: "wx" });
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
    ...(configPath !== null ? ["--config", configPath] : []),
    ...(body !== null ? ["--data-binary", "@-"] : []),
    "--write-out",
    `${STATUS_SENTINEL}%{http_code}`,
    url,
  ];

  // The bearer token sits on disk in `configPath` from here until cleanup. Run
  // the spawn + IO under try/finally so a throw (spawn failure, sink write,
  // Promise.all rejection) can never leave the token config file behind.
  let stdoutText: string;
  let stderrText: string;
  let exitCode: number;
  try {
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

    const settled = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);
    stdoutText = settled[0];
    stderrText = settled[1];
    exitCode = settled[2];
  } finally {
    if (configPath !== null) {
      // Best-effort cleanup; curl has already consumed the config by exit.
      await rm(configPath, { force: true }).catch(() => {});
    }
  }

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

async function askGemini(
  member: ModelCouncilMember,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<MemberReply> {
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
    // WU-B1: if the outer member timeout already fired, stop before spawning
    // another CLI so a timed-out Gemini call cannot keep spawning subprocesses.
    if (signal?.aborted) {
      throw new Error(`${member.name} Gemini CLI aborted before attempt ${attempt}.`);
    }
    const proc = Bun.spawn([geminiPath, "-m", member.model], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });
    // WU-B1: on timeout, kill the in-flight subprocess so the loser cannot keep
    // the process alive.
    const onAbort = () => {
      try {
        proc.kill();
      } catch {
        // already exited
      }
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    let stdout: string;
    let stderr: string;
    let exitCode: number;
    try {
      proc.stdin.write(prompt);
      await proc.stdin.end();
      [stdout, stderr, exitCode] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
      ]);
    } finally {
      signal?.removeEventListener("abort", onAbort);
    }

    if (exitCode === 0) {
      const content = stdout.trim();
      if (content) {
        return { content, usage: null };
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

async function askCodex(
  member: ModelCouncilMember,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<MemberReply> {
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
  // WU-B1: the Codex SDK cancels the turn on the AbortSignal, so the member
  // timeout stops the in-flight turn rather than leaving it running.
  const turn = await thread.run(prompt, signal ? { signal } : undefined);
  const content = normalizeOptionalString(turn.finalResponse);
  if (!content) {
    throw new Error(`${member.name} returned an empty Codex response.`);
  }

  return { content, usage: toTokenUsage(turn.usage) };
}

async function askClaude(
  member: ModelCouncilMember,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<MemberReply> {
  const claudeCodePath = await getClaudeCodeExecutablePath();
  // Council members reason and reply with text only; every tool call is denied
  // by canUseTool below. Tell the member that UP FRONT — otherwise a file-path-
  // rich prompt makes it attempt repo crawls, hit repeated denials, and churn
  // the agent loop until the child process dies (observed: exit code 1 / hang
  // on large analysis-over-a-portfolio prompts). The notice prevents the loop.
  const toolsDisabledNotice =
    "SYSTEM: You have no tools and no file, shell, or network access in this council deliberation. Every tool call is denied. Do not attempt to read files, list directories, search the codebase, or browse the web — reason only from the text provided. Any file paths below are context labels, not invitations to open them.";
  const prompt = [
    toolsDisabledNotice,
    messages.map((message) => `${message.role.toUpperCase()}: ${flattenMessageContent(message.content)}`).join("\n\n"),
  ].join("\n\n");

  // WU-B1: the Claude Agent SDK aborts the query on this controller, so the
  // member timeout cancels the in-flight agent loop instead of leaking it.
  const abortController = new AbortController();
  if (signal) {
    if (signal.aborted) {
      abortController.abort();
    } else {
      signal.addEventListener("abort", () => abortController.abort(), { once: true });
    }
  }

  const response = query({
    prompt,
    options: {
      pathToClaudeCodeExecutable: claudeCodePath,
      model: member.model,
      permissionMode: "default",
      settingSources: ["user"],
      abortController,
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
  let usage: CouncilTokenUsage | null = null;
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
      usage?: unknown;
    };
    if (result.is_error || (result.subtype && result.subtype !== "success")) {
      resultError =
        normalizeOptionalString(result.result) ??
        normalizeOptionalString(result.errors?.filter(Boolean).join("; ")) ??
        normalizeOptionalString(result.error) ??
        "Claude council member failed.";
    } else {
      finalText = normalizeOptionalString(result.result);
      usage = toTokenUsage(result.usage);
    }
  }

  if (resultError) {
    throw new Error(`${member.name} ${resultError}`);
  }
  const content = normalizeOptionalString(finalText);
  if (!content) {
    throw new Error(`${member.name} returned an empty Claude response.`);
  }

  return { content, usage };
}

export function buildProposalMessages(
  prompt: string,
  member: ModelCouncilMember,
  evidencePack?: EvidencePackEntry[],
): ChatMessage[] {
  const baseSystem = [
    `You are ${member.name}, one member of a multi-agent council.`,
    OBJECTIVE_CONSENSUS_DIRECTIVE,
    "Give your independent answer to the user's problem.",
    "Be concrete, identify risks, state your recommended solution, and flag what would change your mind.",
  ].join(" ");

  // Evidence-pack plumbing (WU-B3): prepend supplied entries to the proposal
  // system message so members can cite them by id. When no pack is supplied the
  // system message is byte-identical to the legacy prompt (INV-2).
  const systemContent =
    evidencePack && evidencePack.length > 0 ? `${formatEvidencePack(evidencePack)}\n\n${baseSystem}` : baseSystem;

  return [
    {
      role: "system",
      content: systemContent,
    },
    {
      role: "user",
      content: prompt,
    },
  ];
}

// Render the evidence pack as a stable, citable block for the proposal prompt.
// Each entry is keyed by its id so a downstream Level-1 source-ID check (WU-B2)
// can verify cited ids against the supplied pack.
function formatEvidencePack(evidencePack: EvidencePackEntry[]): string {
  const entries = evidencePack.map((entry) => `- [${entry.id}] (${entry.source}) ${entry.text}`).join("\n");
  return `Evidence pack (cite entries by their [id] when you rely on them):\n${entries}`;
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
    "Return your critique, then CONSENSUS_STATUS: CONVERGED or DIVERGED, then MATERIAL_DISAGREEMENTS: a one-line list or NONE, and finally CANDIDATE_CONSENSUS: followed by the full candidate consensus text as the last section.",
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
        "Before the candidate, emit two marker lines: 'CONSENSUS_STATUS: CONVERGED' if the council now agrees and the candidate is ratifiable as-is, otherwise 'CONSENSUS_STATUS: DIVERGED'; and 'MATERIAL_DISAGREEMENTS:' followed by a one-line list of the substantive disagreements still blocking consensus, or NONE. Put the CANDIDATE_CONSENSUS: section last so the candidate text is captured cleanly.",
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
        "Vote one of three ways. ACCEPT: you endorse the exact artifact without material objection. ACCEPT_WITH_EDITS: you agree on the substance but require specific edits first — this is NOT a veto; the council will fold your edits in. BLOCK: consensus cannot be reached as-is.",
        "Start your response with exactly one marker line, one of: 'CONSENSUS: ACCEPT', 'CONSENSUS: ACCEPT_WITH_EDITS', or 'CONSENSUS: BLOCK'.",
        "If you vote ACCEPT_WITH_EDITS, follow the marker with a 'REQUIRED_EDITS:' line (or block) stating the exact edits you require.",
        "If you vote BLOCK, follow the marker with a 'BLOCK_KIND:' line — one of MATERIAL_DISAGREEMENT, INSUFFICIENT_EVIDENCE, SYNTHESIS_ERROR, FACTUAL_ERROR, PROTOCOL — then explain the blocker. Use FACTUAL_ERROR only when the artifact states something contradicted by the evidence.",
        "Check every factual and source-dependent claim in the artifact against the source material quoted in the original request above; if the artifact asserts something the source contradicts, vote BLOCK with BLOCK_KIND: FACTUAL_ERROR and quote the contradicting source. FACTUAL_ERROR and MATERIAL_DISAGREEMENT are absolute vetoes — they end the council at 'blocked' and cannot be cleared by edits, so reserve them for genuine hard stops, not for edits you could request via ACCEPT_WITH_EDITS.",
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
    .map((ratification) =>
      [`## ${ratification.member.name}`, ratification.vote.requiredEdits ?? ratification.content].join("\n"),
    )
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

export function parseRatificationVote(content: string): RatificationVote {
  // Scan for the first line that bears an explicit CONSENSUS marker, tolerating
  // leading markdown glyphs (**bold**, > blockquote, `code`, # heading, - list)
  // and a short preamble before the marker. A reasoner that bolds the marker or
  // writes one line before it agrees on substance but was previously parsed as a
  // silent BLOCK — the asymmetry that manufactured false vetoes at N=2. The
  // ACCEPT_WITH_EDITS alternative is matched before ACCEPT so the longer token
  // wins. A truly markerless response is a PROTOCOL block — a process failure the
  // caller can re-ask, not a substantive veto.
  const stripped = content.split(/\r?\n/).map((line) => line.trim().replace(/^[>*_`#\s-]+/, ""));
  const markerLine = stripped.find((line) => /^CONSENSUS:\s*(ACCEPT_WITH_EDITS|ACCEPT|BLOCK)\b/i.test(line));
  const marker = markerLine?.match(/^CONSENSUS:\s*(ACCEPT_WITH_EDITS|ACCEPT|BLOCK)\b/i)?.[1]?.toUpperCase();
  if (marker === "ACCEPT") {
    return { decision: "accept", raw: content };
  }
  if (marker === "ACCEPT_WITH_EDITS") {
    const edits = content.match(/REQUIRED_EDITS:\s*([\s\S]*)$/i)?.[1]?.trim();
    return { decision: "accept_with_edits", requiredEdits: edits || undefined, raw: content };
  }
  if (marker === "BLOCK") {
    return { decision: "block", blockKind: parseBlockKind(stripped), raw: content };
  }
  return { decision: "block", blockKind: "PROTOCOL", raw: content };
}

const RATIFICATION_BLOCK_KINDS: readonly RatificationBlockKind[] = [
  "MATERIAL_DISAGREEMENT",
  "INSUFFICIENT_EVIDENCE",
  "SYNTHESIS_ERROR",
  "FACTUAL_ERROR",
  "PROTOCOL",
];

// Read the BLOCK_KIND: line (if any), tolerating the same leading glyphs as the
// marker scan. Returns undefined when no recognized kind is stated — a bare BLOCK.
function parseBlockKind(strippedLines: string[]): RatificationBlockKind | undefined {
  const kinds = RATIFICATION_BLOCK_KINDS.join("|");
  const re = new RegExp(`^BLOCK_KIND:\\s*(${kinds})\\b`, "i");
  const line = strippedLines.find((l) => re.test(l));
  const kind = line?.match(re)?.[1]?.toUpperCase();
  return RATIFICATION_BLOCK_KINDS.find((k) => k === kind);
}

// Back-compat boolean view of the vote (true iff a clean ACCEPT). Retained
// because it is exported and unit-tested; new code reads parseRatificationVote.
export function parseRatificationAccepted(content: string): boolean {
  return parseRatificationVote(content).decision === "accept";
}

function parseCandidateConsensus(content: string): string {
  const marker = "CANDIDATE_CONSENSUS:";
  const index = content.toUpperCase().indexOf(marker);
  if (index < 0) {
    return content.trim();
  }
  return content.slice(index + marker.length).trim();
}

// A member's self-reported convergence signal, parsed from the CONSENSUS_STATUS /
// MATERIAL_DISAGREEMENTS markers it appends after its CANDIDATE_CONSENSUS. This is
// the primary agreement signal (F3): a member declaring it has converged with no
// material disagreements is a far more reliable consensus indicator than token
// overlap, which is length-biased and systematically low for verbose prose.
export type ConsensusReportStatus = "converged" | "diverged" | "unknown";

export type ConsensusSignal = {
  // "unknown" when the member emitted no CONSENSUS_STATUS marker (older transcript
  // or a model that ignored the instruction) — callers fall back to draft overlap.
  status: ConsensusReportStatus;
  // True when the member listed at least one material disagreement (anything other
  // than NONE). Suppresses convergence even if status parsed as CONVERGED.
  hasMaterialDisagreements: boolean;
  // The raw one-line disagreement list (or "" / "NONE"), retained for telemetry.
  disagreements: string;
};

export function parseConsensusSignal(content: string): ConsensusSignal {
  // Mirror parseRatificationVote's tolerant scan: strip leading markdown glyphs so
  // a bolded / blockquoted / list-item marker still parses.
  const lines = content.split(/\r?\n/).map((line) => line.trim().replace(/^[>*_`#\s-]+/, ""));
  const statusRe = /^CONSENSUS_STATUS:\s*(CONVERGED|DIVERGED)\b/i;
  const statusToken = lines
    .find((line) => statusRe.test(line))
    ?.match(statusRe)?.[1]
    ?.toUpperCase();
  const status: ConsensusReportStatus =
    statusToken === "CONVERGED" ? "converged" : statusToken === "DIVERGED" ? "diverged" : "unknown";
  const disagreements =
    lines
      .find((line) => /^MATERIAL_DISAGREEMENTS:/i.test(line))
      ?.replace(/^MATERIAL_DISAGREEMENTS:\s*/i, "")
      .trim() ?? "";
  const hasMaterialDisagreements = disagreements.length > 0 && !/^NONE$/i.test(disagreements);
  return { status, hasMaterialDisagreements, disagreements };
}

// --- Structured (Claim-Ledger Delphi) parse seam — WU-B1 -------------------
//
// Additive, flag-gated wrappers around the legacy text parsers above. INV-2:
// the structured `schemas` module is reachable ONLY under
// `AGENTS_COUNCIL_STRUCTURED`, and is loaded ONLY via the guarded dynamic
// import() inside the flag branch — so the legacy (flag-off) path never imports
// or evaluates it, and the legacy sync parsers above are untouched (byte-for-
// byte). INV-7: these wire additively into the existing parsers; no fork.
//
// When the flag is off these wrappers return the legacy parse synchronously,
// without touching the schema module. When the flag is on, they attempt a Zod
// validation of a structured payload and fall back to the same legacy parser on
// any validation failure (incrementing the per-run parse-fail counter).

export function isStructuredCouncilEnabled(): boolean {
  return process.env.AGENTS_COUNCIL_STRUCTURED === "1" || process.env.AGENTS_COUNCIL_STRUCTURED === "true";
}

export async function parseRatificationVoteStructured(content: string): Promise<RatificationVote> {
  if (!isStructuredCouncilEnabled()) {
    return parseRatificationVote(content);
  }
  const { parseStructuredOrFallback, RatificationVoteSchema } = await import("./council/schemas");
  const result = parseStructuredOrFallback(content, RatificationVoteSchema, parseRatificationVote);
  // The structured schema omits `raw`; rehydrate the legacy shape so downstream
  // consumers (which read `vote.raw`) keep working.
  if ("raw" in result) {
    return result;
  }
  return { ...result, raw: content };
}

export async function parseConsensusSignalStructured(content: string): Promise<ConsensusSignal> {
  if (!isStructuredCouncilEnabled()) {
    return parseConsensusSignal(content);
  }
  const { parseStructuredOrFallback, DeliberationResponseSchema } = await import("./council/schemas");
  const fallbackToSignal = (raw: string): ConsensusSignal => parseConsensusSignal(raw);
  const parsed = parseStructuredOrFallback(content, DeliberationResponseSchema, fallbackToSignal);
  if ("status" in parsed && "hasMaterialDisagreements" in parsed) {
    // Legacy fallback already produced a ConsensusSignal.
    return parsed;
  }
  const disagreements = (parsed.materialDisagreements ?? []).join("; ");
  return {
    status: parsed.consensusStatus ?? "unknown",
    hasMaterialDisagreements: (parsed.materialDisagreements ?? []).length > 0,
    disagreements,
  };
}

export async function parseCandidateConsensusStructured(content: string): Promise<string> {
  if (!isStructuredCouncilEnabled()) {
    return parseCandidateConsensus(content);
  }
  const { parseStructuredOrFallback, DeliberationResponseSchema } = await import("./council/schemas");
  const parsed = parseStructuredOrFallback(content, DeliberationResponseSchema, parseCandidateConsensus);
  return typeof parsed === "string" ? parsed : parsed.candidateConsensus;
}

// --- Claim-ledger ratification preconditions — WU-B2 -----------------------
//
// Block-preconditions on ratification ELIGIBILITY (not a new controller). Under
// AGENTS_COUNCIL_STRUCTURED they inspect the structured claims members emitted
// and raise an absolute block through the EXISTING BLOCK_KIND/veto machinery
// when a claim is unverifiable. Three deterministic checks (INV-9 — pure code,
// no LLM, no sandbox, no network):
//   1. an unlabeled factual claim (a claim with no provenance label);
//   2. an `assumption` with no stated cheapest_verification;
//   3. Level-1 source-ID (Addendum A.3.3): a `repo_fact` whose cited
//      evidence-pack id is not present in the supplied pack.
// A fired precondition is surfaced as a FACTUAL_ERROR block — already the
// absolute kind (F7), so it ends the council at "blocked" and skips repair
// (INV-4 preserved: we RAISE a block via the existing enum, we do not weaken
// any veto's absoluteness). INV-3: these blocks enter only the ratifications
// array, after the deliberation loop; isConverged never reads them.

// The shape a structured member payload may carry claims under. Members emit a
// DeliberationResponse / IndependentProposal whose `claims` we inspect; we read
// the claim fields tolerantly (a partial / loosely-typed payload still gets
// checked rather than silently passing).
type ClaimLike = {
  provenance?: string;
  evidence?: unknown;
  cheapestVerification?: unknown;
  cheapest_verification?: unknown;
};

export type RatificationPrecondition = {
  kind: "UNLABELED_CLAIM" | "ASSUMPTION_NO_VERIFICATION" | "SOURCE_ID_MISMATCH";
  detail: string;
};

// Pure, deterministic evaluation of the three claim-ledger preconditions over a
// set of structured claims and the supplied evidence-pack ids (INV-9). No model
// call, no eval/sandbox, no network. Returns every precondition that fired.
export function evaluateClaimLedgerPreconditions(
  claims: ClaimLike[],
  evidencePackIds: ReadonlySet<string>,
): RatificationPrecondition[] {
  const fired: RatificationPrecondition[] = [];
  for (const claim of claims) {
    const provenance = typeof claim.provenance === "string" ? claim.provenance.trim() : "";
    // (1) Unlabeled factual claim: no provenance label at all.
    if (provenance.length === 0) {
      fired.push({ kind: "UNLABELED_CLAIM", detail: "a factual claim was emitted with no provenance label" });
      continue;
    }
    // (2) Assumption with no stated cheapest verification.
    if (provenance === "assumption") {
      const verification = claim.cheapestVerification ?? claim.cheapest_verification;
      const stated = typeof verification === "string" && verification.trim().length > 0;
      if (!stated) {
        fired.push({
          kind: "ASSUMPTION_NO_VERIFICATION",
          detail: "an assumption was emitted with no stated cheapest_verification",
        });
      }
      continue;
    }
    // (3) Level-1 deterministic source-ID check: a repo_fact must cite an id
    // present in the supplied evidence pack. A repo_fact citing nothing, or an
    // id absent from the pack, fails the check.
    if (provenance === "repo_fact") {
      const cited = Array.isArray(claim.evidence)
        ? claim.evidence.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        : [];
      const missing = cited.length === 0 ? [""] : cited.filter((id) => !evidencePackIds.has(id.trim()));
      if (missing.length > 0) {
        const citedDesc = cited.length === 0 ? "no evidence-pack id" : `id(s) ${missing.join(", ")}`;
        fired.push({
          kind: "SOURCE_ID_MISMATCH",
          detail: `a repo_fact cited ${citedDesc} not present in the evidence pack`,
        });
      }
    }
  }
  return fired;
}

// Synthesize a block ratification carrying the existing FACTUAL_ERROR kind from a
// fired precondition. Attributed to the member whose payload tripped it so the
// transcript and minority report (WU-B4) can name the source.
function preconditionBlockRatification(
  member: MemberRef,
  preconditions: RatificationPrecondition[],
): ModelCouncilRatification {
  const detail = preconditions.map((p) => `${p.kind}: ${p.detail}`).join("; ");
  return {
    member,
    content: `CONSENSUS: BLOCK\nBLOCK_KIND: FACTUAL_ERROR\nClaim-ledger precondition(s) failed: ${detail}`,
    accepted: false,
    vote: {
      decision: "block",
      blockKind: "FACTUAL_ERROR",
      raw: `claim-ledger precondition: ${detail}`,
    },
  };
}

// Flag-gated applier: under AGENTS_COUNCIL_STRUCTURED only, parse each member's
// final-round content for structured claims (via the WU-B1 guarded dynamic
// import — never a top-level static import), run the pure preconditions against
// the evidence-pack ids, and return one synthetic FACTUAL_ERROR block per member
// that tripped a precondition. Flag OFF (INV-2): returns [] WITHOUT importing the
// schema module or inspecting any label — the legacy ratification path is then
// byte-for-byte unchanged.
export async function evaluateRatificationPreconditions(
  proposals: ModelCouncilCandidateProposal[],
  evidencePack: EvidencePackEntry[] | undefined,
): Promise<ModelCouncilRatification[]> {
  if (!isStructuredCouncilEnabled()) {
    return [];
  }
  const { parseStructuredOrFallback, DeliberationResponseSchema } = await import("./council/schemas");
  const evidencePackIds = new Set((evidencePack ?? []).map((entry) => entry.id));
  const blocks: ModelCouncilRatification[] = [];
  for (const proposal of proposals) {
    // Extract structured claims if the member emitted a parseable structured
    // payload; a non-structured (legacy text) payload yields no claims and so
    // cannot trip a precondition — the heuristic is best-effort in Wave B.
    const parsed = parseStructuredOrFallback(proposal.content, DeliberationResponseSchema, () => null);
    if (parsed === null || typeof parsed === "string" || !("claims" in parsed)) {
      continue;
    }
    const fired = evaluateClaimLedgerPreconditions(parsed.claims as ClaimLike[], evidencePackIds);
    if (fired.length > 0) {
      blocks.push(preconditionBlockRatification(proposal.member, fired));
    }
  }
  return blocks;
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

// A round is converged once any arm fires (strict superset of the old behavior):
//   1. byte-identical shared candidate between rounds (changed === false);
//   2. the shared candidate is near-identical round-to-round (similarityToPrevious
//      ≥ DEFAULT_CONVERGENCE_SIMILARITY_THRESHOLD) — the candidate has stabilized;
//   3. PRIMARY (F3): the members self-report agreement via CONSENSUS_STATUS — every
//      member that spoke says CONVERGED and none lists a material disagreement.
//      Self-report beats token overlap, which is length-biased and systematically
//      low for the prose the council reasons in;
//   4. FALLBACK (F3): when no member emitted the markers, fall back to draft
//      agreement measured by the overlap coefficient (less length-biased than the
//      Jaccard memberAgreement, which is now kept only as a telemetry metric).
// An explicit DIVERGED / material-disagreement report suppresses the draft-overlap
// fallback — a member that says it still disagrees should not be early-stopped by
// lexical coincidence — but the candidate-stability arms (1–2) still short-circuit,
// since a frozen artifact is ratify-ready and any residual objection surfaces as a
// BLOCK at ratification. NOTE: post-F2 this gate only controls early-stop (whether
// the loop breaks before maxRounds); it no longer decides whether ratification
// runs, so loosening or tightening it cannot change a ratified outcome.
export function isConverged(round: ModelCouncilRound): boolean {
  if (!round.changed) {
    return true;
  }
  const simThreshold = resolveConvergenceSimilarityThreshold();
  if (round.similarityToPrevious !== null && round.similarityToPrevious >= simThreshold) {
    return true;
  }
  // Structured self-reported signal (F3), primary over any lexical proxy.
  const signals = round.proposals.map((proposal) => parseConsensusSignal(proposal.content));
  if (signals.some((signal) => signal.status === "diverged" || signal.hasMaterialDisagreements)) {
    return false;
  }
  if (signals.length > 0 && signals.every((signal) => signal.status !== "unknown")) {
    return true;
  }
  // No member emitted the markers — fall back to draft overlap (overlap coefficient,
  // not the demoted Jaccard memberAgreement).
  const agreementThreshold = resolveConvergenceAgreementThreshold();
  const draftOverlap = averagePairwiseOverlap(
    round.proposals.map((proposal) => proposal.candidateConsensus || proposal.content),
  );
  return Number.isFinite(draftOverlap) && draftOverlap >= agreementThreshold;
}

export function resolveMaxRounds(): number {
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

// Overlap coefficient |A∩B| / min(|A|,|B|) in [0, 1]. Used as the F3 convergence
// fallback because, unlike Jaccard, it is not deflated when one draft is far longer
// than the other — the dominant failure mode for verbose council members.
function overlapCoefficient(a: string, b: string): number {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (setA.size === 0 && setB.size === 0) {
    return 1;
  }
  const [smaller, larger] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
  let intersection = 0;
  for (const token of smaller) {
    if (larger.has(token)) {
      intersection++;
    }
  }
  return smaller.size === 0 ? 0 : intersection / smaller.size;
}

function averagePairwiseOverlap(texts: string[]): number {
  const usable = texts.filter((text) => text.trim().length > 0);
  if (usable.length < 2) {
    return 1;
  }
  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < usable.length; i++) {
    for (let j = i + 1; j < usable.length; j++) {
      sum += overlapCoefficient(usable[i]!, usable[j]!);
      pairs++;
    }
  }
  return pairs === 0 ? 1 : sum / pairs;
}

export function buildConsensusResult(
  ratifications: ModelCouncilRatification[],
  _members: ModelCouncilMember[],
): ModelCouncilConsensus {
  if (ratifications.length === 0) {
    // Ratify never ran — no non-empty candidate ever emerged, so no member voted.
    // This is now the ONLY genuine "not_attempted": a low Jaccard score no longer
    // suppresses ratification (see F2 in runModelCouncil), so any candidate the
    // members actually voted on is ratified/blocked, never silently not_attempted.
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
  if (reached) {
    return { reached: true, outcome: "ratified", ratifiedBy, blockedBy };
  }
  // Blocked. If the block is an absolute veto (F7), say so in the reason so the
  // outcome is self-explaining — a hard stop, not a repairable "ACCEPT after edits".
  const veto = ratifications.find(isAbsoluteVeto);
  // Minority report (WU-B4): every dissenting ratification becomes a first-class
  // record, so the blocking objections — including a WU-B2 claim-ledger
  // FACTUAL_ERROR precondition, which is itself a blocking ratification — are never
  // silently dropped on a `blocked` outcome. Keyed off `blocked` only; the top-level
  // enum is unchanged (INV-6).
  const minorityReport: MinorityReportEntry[] = ratifications
    .filter((ratification) => !ratification.accepted)
    .map((ratification) => ({
      member: ratification.member.name,
      ...(ratification.vote.blockKind ? { blockKind: ratification.vote.blockKind } : {}),
      absolute: isAbsoluteVeto(ratification),
      dissent: ratification.content,
    }));
  return {
    reached: false,
    outcome: "blocked",
    ratifiedBy,
    blockedBy,
    ...(veto ? { notRatifiedReason: `unrepairable veto: ${veto.vote.blockKind} (raised by ${veto.member.name})` } : {}),
    minorityReport,
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

function useDirectVendorKeys(): boolean {
  const raw = readEnv(DIRECT_VENDOR_KEYS_ENV);
  return raw === "1" || raw?.toLowerCase() === "true" || raw?.toLowerCase() === "yes";
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

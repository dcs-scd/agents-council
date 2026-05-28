import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";

import { CouncilServiceImpl } from "../src/core/services/council";
import { summonAgent } from "../src/core/services/council/summon";
import type { CouncilFeedback } from "../src/core/services/council/types";
import { FileCouncilStateStore } from "../src/core/state/fileStateStore";

type Options = {
  ledgerPath: string;
  rounds: number;
  append: boolean;
  dryRun: boolean;
  claudeModel: string | null;
  codexModel: string | null;
  codexReasoningEffort: string | null;
  workspace: string;
};

const DEFAULT_ROUNDS = 2;
const ORCHESTRATOR = "HALO Recovery Orchestrator";
const CODEX = "Codex";
const CLAUDE = "Claude";
const CONSENSUS_ITEMS = ["C0", "C1", "C2", "C3", "C4"] as const;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const ledgerPath = path.resolve(options.ledgerPath);
  const ledger = await readFile(ledgerPath, "utf8");
  const request = buildCouncilRequest(ledger, options.rounds);
  const codexSeed = buildCodexSeed(ledger);

  if (options.dryRun) {
    printDryRun(ledgerPath, request, codexSeed, options);
    return;
  }

  const service = new CouncilServiceImpl(new FileCouncilStateStore());
  const started = await service.startCouncil({ agentName: ORCHESTRATOR, request });
  const sessionId = started.session.id;

  const seed = await service.sendResponseToSession({
    agentName: CODEX,
    content: codexSeed,
    sessionId,
  });

  const transcript: CouncilFeedback[] = [seed.feedback];
  let terminalStatus: string | null = null;

  for (let round = 1; round <= options.rounds; round++) {
    console.log(`Round ${round}: summoning ${CLAUDE}`);
    const claude = await summonAgent({
      agent: CLAUDE,
      model: options.claudeModel,
      workingDirectory: options.workspace,
      readOnlyEvidence: true,
    });
    transcript.push(claude.feedback);

    console.log(`Round ${round}: summoning ${CODEX}`);
    const codex = await summonAgent({
      agent: CODEX,
      model: options.codexModel,
      reasoningEffort: options.codexReasoningEffort,
      workingDirectory: options.workspace,
      readOnlyEvidence: true,
    });
    transcript.push(codex.feedback);

    terminalStatus = extractTerminalStatus(codex.feedback.content);
    if (terminalStatus === "CONSENSUS_READY" || terminalStatus === "DO_NOT_IMPLEMENT") {
      break;
    }
  }

  const session = await service.getSessionData({ agentName: ORCHESTRATOR, sessionId });
  const result = formatAppendix({
    ledgerPath,
    sessionId,
    startedAt: started.session.createdAt,
    terminalStatus,
    feedback: session.feedback,
  });

  if (options.append) {
    await appendFile(ledgerPath, result, "utf8");
  }

  console.log(result.trim());
}

function parseArgs(args: string[]): Options {
  let ledgerPath: string | null = null;
  let rounds = DEFAULT_ROUNDS;
  let append = true;
  let dryRun = false;
  let claudeModel: string | null = null;
  let codexModel: string | null = null;
  let codexReasoningEffort: string | null = null;
  let workspace: string | null = null;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (!arg) {
      continue;
    }
    if (arg === "--rounds") {
      const value = args[++index];
      rounds = parsePositiveInt(value, "--rounds");
      continue;
    }
    if (arg.startsWith("--rounds=")) {
      rounds = parsePositiveInt(arg.slice("--rounds=".length), "--rounds");
      continue;
    }
    if (arg === "--no-append") {
      append = false;
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      append = false;
      continue;
    }
    if (arg === "--claude-model") {
      claudeModel = parseNonEmptyValue(args[++index], "--claude-model");
      continue;
    }
    if (arg.startsWith("--claude-model=")) {
      claudeModel = parseNonEmptyValue(arg.slice("--claude-model=".length), "--claude-model");
      continue;
    }
    if (arg === "--codex-model") {
      codexModel = parseNonEmptyValue(args[++index], "--codex-model");
      continue;
    }
    if (arg.startsWith("--codex-model=")) {
      codexModel = parseNonEmptyValue(arg.slice("--codex-model=".length), "--codex-model");
      continue;
    }
    if (arg === "--codex-reasoning-effort") {
      codexReasoningEffort = parseNonEmptyValue(args[++index], "--codex-reasoning-effort");
      continue;
    }
    if (arg.startsWith("--codex-reasoning-effort=")) {
      codexReasoningEffort = parseNonEmptyValue(
        arg.slice("--codex-reasoning-effort=".length),
        "--codex-reasoning-effort",
      );
      continue;
    }
    if (arg === "--workspace") {
      workspace = parseNonEmptyValue(args[++index], "--workspace");
      continue;
    }
    if (arg.startsWith("--workspace=")) {
      workspace = parseNonEmptyValue(arg.slice("--workspace=".length), "--workspace");
      continue;
    }
    if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    if (ledgerPath !== null) {
      throw new Error(`Unexpected extra argument: ${arg}`);
    }
    ledgerPath = arg;
  }

  if (!ledgerPath) {
    throw new Error("Missing ledger path.");
  }

  const absoluteLedgerPath = path.resolve(ledgerPath);
  return {
    ledgerPath,
    rounds,
    append,
    dryRun,
    claudeModel,
    codexModel,
    codexReasoningEffort,
    workspace: path.resolve(workspace ?? path.join(path.dirname(absoluteLedgerPath), "..")),
  };
}

function parsePositiveInt(value: string | undefined, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new Error(`${label} must be an integer from 1 to 5.`);
  }
  return parsed;
}

function parseNonEmptyValue(value: string | undefined, label: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`${label} requires a value.`);
  }
  return normalized;
}

function buildCouncilRequest(ledger: string, rounds: number): string {
  return [
    "You are participating in a bounded HALO-X recovery design council.",
    "",
    "Goal: resolve only consensus items C0-C4 from the ledger below.",
    "",
    "Protocol:",
    `- Maximum rounds: ${rounds}.`,
    "- Read-only repository evidence is available to summoned agents through the configured workspace.",
    "- Codex has already seeded its objections as prior feedback.",
    "- Claude must reconcile the objections against HALO-X code/contracts.",
    "- Codex must then mark each item RESOLVED or BLOCKED.",
    "- Do not introduce new scope beyond C0-C4.",
    "- Prefer concrete evidence from the repository over design preference.",
    "",
    "Required response shape:",
    "- For each item C0-C4, write one line: Cn: ACCEPTED, REJECTED, NEEDS_EVIDENCE, RESOLVED, or BLOCKED.",
    "- If BLOCKED, include the minimal correction.",
    "- End with exactly one terminal line: CONSENSUS_READY, NEEDS_CODEX_REVIEW, NEEDS_ONE_MORE_ROUND, or DO_NOT_IMPLEMENT.",
    "",
    "Ledger:",
    "```markdown",
    ledger.trim(),
    "```",
  ].join("\n");
}

function buildCodexSeed(ledger: string): string {
  const positions = extractCodexPositions(ledger);
  if (positions.length === 0) {
    return [
      "Codex seed objection:",
      "The ledger did not contain explicit Codex positions. Treat C0-C4 as open and require evidence before implementation.",
      "NEEDS_CODEX_REVIEW",
    ].join("\n");
  }

  return [
    "Codex seed objections, extracted from the consensus ledger:",
    "",
    ...positions.map((position) => `- ${position}`),
    "",
    "Claude should ACCEPT each objection or REJECT it with concrete HALO-X code/contract evidence.",
    "NEEDS_CODEX_REVIEW",
  ].join("\n");
}

function extractCodexPositions(ledger: string): string[] {
  const lines = ledger.split(/\r?\n/);
  const positions: string[] = [];
  let currentItem: string | null = null;

  for (const rawLine of lines) {
    const heading = rawLine.match(/^###\s+(C\d):/);
    if (heading) {
      currentItem = heading[1] ?? null;
      continue;
    }

    const position = rawLine.match(/^Codex position:\s*(.+)$/);
    if (position?.[1] && currentItem) {
      positions.push(`${currentItem}: ${position[1].trim()}`);
    }
  }

  return positions;
}

function extractTerminalStatus(content: string): string | null {
  const matches = content.match(/\b(CONSENSUS_READY|NEEDS_CODEX_REVIEW|NEEDS_ONE_MORE_ROUND|DO_NOT_IMPLEMENT)\b/g);
  return matches?.at(-1) ?? null;
}

function parseItemStatuses(content: string): string[] {
  const statuses: string[] = [];
  for (const item of CONSENSUS_ITEMS) {
    const match = content.match(new RegExp(`\\b${item}\\s*:\\s*([^\\n]+)`, "i"));
    if (match?.[1]) {
      statuses.push(`${item}: ${match[1].trim()}`);
    } else {
      statuses.push(`${item}: MISSING`);
    }
  }
  return statuses;
}

function formatAppendix(input: {
  ledgerPath: string;
  sessionId: string;
  startedAt: string;
  terminalStatus: string | null;
  feedback: CouncilFeedback[];
}): string {
  const latestByAuthor = new Map<string, CouncilFeedback>();
  for (const feedback of input.feedback) {
    latestByAuthor.set(feedback.author, feedback);
  }

  const latestCodex = latestByAuthor.get(CODEX);
  const latestClaude = latestByAuthor.get(CLAUDE);
  const codexStatuses = latestCodex
    ? parseItemStatuses(latestCodex.content)
    : CONSENSUS_ITEMS.map((item) => `${item}: MISSING`);

  return [
    "",
    "",
    "## Recovery Council Run",
    "",
    `- Session: ${input.sessionId}`,
    `- Started: ${input.startedAt}`,
    `- Terminal status: ${input.terminalStatus ?? "UNKNOWN"}`,
    "",
    "### Latest Codex Resolution",
    "",
    ...codexStatuses.map((status) => `- ${status}`),
    "",
    latestCodex ? fenced("Codex", latestCodex.content) : "_No Codex response recorded._",
    "",
    "### Latest Claude Reconciliation",
    "",
    latestClaude ? fenced("Claude", latestClaude.content) : "_No Claude response recorded._",
  ].join("\n");
}

function fenced(label: string, content: string): string {
  return [`#### ${label}`, "", "```text", content.trim(), "```"].join("\n");
}

function printDryRun(ledgerPath: string, request: string, codexSeed: string, options: Options): void {
  console.log(`ledger=${ledgerPath}`);
  console.log(`rounds=${options.rounds}`);
  console.log(`append=${options.append}`);
  console.log(`claude_model=${options.claudeModel ?? "(saved/default)"}`);
  console.log(`codex_model=${options.codexModel ?? "(saved/default)"}`);
  console.log(`codex_reasoning_effort=${options.codexReasoningEffort ?? "(saved/default)"}`);
  console.log(`workspace=${options.workspace}`);
  console.log(`request_bytes=${Buffer.byteLength(request, "utf8")}`);
  console.log(`codex_seed_bytes=${Buffer.byteLength(codexSeed, "utf8")}`);
  console.log("codex_seed_preview=");
  console.log(codexSeed.split(/\r?\n/).slice(0, 12).join("\n"));
}

function printHelp(): void {
  console.log(`Usage: bun scripts/halo-recovery-council.ts <ledger.md> [--rounds N] [--dry-run] [--no-append]

Runs a bounded Claude/Codex recovery council over a HALO-X consensus ledger.

Options:
  --rounds N                  Claude/Codex rounds to run, 1-5. Default: ${DEFAULT_ROUNDS}
  --claude-model MODEL        Override saved/default Claude model for this run.
  --codex-model MODEL         Override saved/default Codex model for this run.
  --codex-reasoning-effort E  Override saved/default Codex reasoning effort.
  --workspace DIR             Read-only evidence workspace. Default: parent of ledger directory.
  --dry-run                   Build prompts and seed feedback without summoning agents or appending.
  --no-append                 Print the run appendix without writing it to the ledger.
`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`halo-recovery-council failed: ${message}`);
  process.exit(1);
});

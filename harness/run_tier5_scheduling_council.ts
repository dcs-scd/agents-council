#!/usr/bin/env bun

import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  formatModelCouncilMarkdown,
  runModelCouncil,
  type ModelCouncilResult,
} from "../src/core/services/modelCouncil";

const ROOT = "/home/dstefanescu/other_systems/o4";
const SCHED_DIR = path.join(ROOT, "hope/ip_hope_tier_5/redesign_scheduling");
const RECOMMENDATION_PREFIX = "tier5_multiflow_agents_council";
const ALTERNATIVE_PREFIX = "tier5_multiflow_alternative_proposal_council";
const REPAIR_PREFIX = "tier5_multiflow_alternative_proposal_council_repair";

const files = {
  latest: path.join(SCHED_DIR, "ecs350_ranns.md"),
  ecs350: path.join(SCHED_DIR, "ecs350.md"),
  pro55: path.join(SCHED_DIR, "55pro_proposal.md"),
  openrouter: path.join(SCHED_DIR, "OpenRouter Chat Fri Jun 05 2026.md"),
  pdfScientistOne: path.join(SCHED_DIR, "2605.26340v1.pdf"),
  pdfSelfRevising: path.join(SCHED_DIR, "2606.01444v1.pdf"),
};

type PdfSummary = {
  file: string;
  frontMatter: string;
  abstractLike: string;
  windows: string[];
};

function normalizeText(value: string): string {
  return value.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

async function readUtf8(file: string): Promise<string> {
  return normalizeText(await readFile(file, "utf8"));
}

function keywordWindows(text: string, terms: string[], maxWindows: number, radius = 420): string[] {
  const lower = text.toLowerCase();
  const windows: string[] = [];
  const seen = new Set<string>();
  for (const term of terms) {
    const needle = term.toLowerCase();
    let index = 0;
    while ((index = lower.indexOf(needle, index)) >= 0 && windows.length < maxWindows) {
      const start = Math.max(0, index - radius);
      const end = Math.min(text.length, index + needle.length + radius);
      const key = `${start}:${end}`;
      if (!seen.has(key)) {
        seen.add(key);
        windows.push(text.slice(start, end).replace(/\s+/g, " ").trim());
      }
      index += needle.length;
    }
  }
  return windows;
}

function firstNChars(text: string, n: number): string {
  if (text.length <= n) {
    return text;
  }
  return `${text.slice(0, n).trim()}\n\n[truncated at ${n} chars]`;
}

function summarizeMarkdown(name: string, text: string, maxWindows: number): string {
  const headings = text
    .split("\n")
    .filter((line) => /^#{1,4}\s+/.test(line))
    .slice(0, 80)
    .join("\n");
  const windows = keywordWindows(
    text,
    [
      "multiflow",
      "scheduler",
      "scheduling",
      "RANSS",
      "RANN",
      "all-hop",
      "conflict",
      "certificate",
      "exact solver",
      "beam",
      "greedy",
      "FlowFold",
      "AlphaFold",
      "Chain-of-Evidence",
      "SCPR",
      "regime",
      "schema",
      "validation",
      "fairness",
      "deadline",
      "latency",
    ],
    maxWindows,
  );
  return [
    `## ${name}`,
    "",
    "### Headings",
    headings || "(none)",
    "",
    "### Selected evidence windows",
    windows.map((window, index) => `- W${index + 1}: ${window}`).join("\n") || "(none)",
  ].join("\n");
}

function summarizePdf(file: string): PdfSummary {
  const raw = execFileSync("pdftotext", ["-layout", file, "-"], {
    encoding: "utf8",
    maxBuffer: 24 * 1024 * 1024,
  });
  const text = normalizeText(raw);
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const abstractIndex = lines.findIndex((line) => /^abstract\b/i.test(line));
  const introIndex = lines.findIndex((line) => /^(1\.?\s+)?introduction\b/i.test(line));
  const abstractLike =
    abstractIndex >= 0
      ? lines.slice(abstractIndex, Math.min(introIndex > abstractIndex ? introIndex : abstractIndex + 28, abstractIndex + 35)).join(" ")
      : lines.slice(0, 35).join(" ");
  return {
    file: path.basename(file),
    frontMatter: lines.slice(0, 12).join(" | "),
    abstractLike: firstNChars(abstractLike, 2200),
    windows: keywordWindows(
      text,
      [
        "Chain-of-Evidence",
        "ScientistOne",
        "verifiability",
        "score verification",
        "specification violation",
        "reference verification",
        "method-code alignment",
        "self-revising",
        "regime",
        "schema",
        "functor",
        "transport",
        "residual",
        "MDL",
      ],
      8,
    ),
  };
}

function renderPdfSummary(summary: PdfSummary): string {
  return [
    `## ${summary.file}`,
    "",
    `Front matter: ${summary.frontMatter}`,
    "",
    `Abstract/front excerpt: ${summary.abstractLike}`,
    "",
    "Selected windows:",
    summary.windows.map((window, index) => `- P${index + 1}: ${window}`).join("\n"),
  ].join("\n");
}

function implementationContext(): string {
  return [
    "## Current Tier 5 scheduler substrate observed in code",
    "",
    "- Existing modules include `scheduler/{greedy_rolling_horizon.py,beam_batch.py,exact_reference.py,objective.py}`, `conflict/{compatibility_oracle.py,conflict_graph.py,conflict_rules.py}`, `validate/{schedule_validator.py,certificate_authority.py}`, `occupancy/reservation.py`, ledgers, flow policy, fairness, analytics, and RouteFold guidance.",
    "- `GreedyRollingHorizonScheduler50` is the deterministic release-path scheduler: sort candidate sets by latest finish, candidate utility, id; try candidates until compatibility oracle does not reject; defer otherwise.",
    "- `BeamBatchScheduler50` is a deterministic beam search, shadow by default, with explicit release mode gated by validator approval.",
    "- `ExactReferenceSolver50` enumerates candidate choices for small fixtures and remains non-release.",
    "- Shared conversion `_candidate_to_transmission(candidate, index)` currently requires `candidate.schedule_template` but uses `candidate.schedule_template.hops[0]` only to create one `ScheduledTransmissionView50` per candidate.",
    "- Objective scoring already sees full-template shape through `ObjectiveTemplateView50.from_template`, which uses `len(template.hops)` and summed hop window spans. That means scoring can reflect all-hop cost while feasibility can still be first-hop-biased.",
    "- `ScheduleValidator50` approves only when execution certificates, a schedule certificate, and compatibility-reuse checks pass. The actual all-hop schedule certificate content is the missing hard proof surface the proposals are targeting.",
    "- `ResourceReservation50` already models slot, band, relay, tx/rx, link, lifecycle state, and schedule certificate refs per reservation, which is a natural target for all-hop reservation materialization.",
  ].join("\n");
}

type CouncilMode = "recommendation" | "alternative" | "repair";

function councilMode(): CouncilMode {
  if (process.argv.some((arg) => arg === "--repair-json" || arg.startsWith("--repair-json="))) {
    return "repair";
  }
  return process.argv.includes("--alternative-proposal") ? "alternative" : "recommendation";
}

function resultPrefix(mode: CouncilMode): string {
  if (mode === "alternative") {
    return ALTERNATIVE_PREFIX;
  }
  if (mode === "repair") {
    return REPAIR_PREFIX;
  }
  return RECOMMENDATION_PREFIX;
}

function repairJsonPath(): string {
  const inline = process.argv.find((arg) => arg.startsWith("--repair-json="));
  if (inline) {
    return path.resolve(inline.slice("--repair-json=".length));
  }
  const index = process.argv.indexOf("--repair-json");
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value) {
    throw new Error("--repair-json requires a path");
  }
  return path.resolve(value);
}

async function buildRepairPrompt(): Promise<string> {
  const previousPath = repairJsonPath();
  const previous = JSON.parse(await readFile(previousPath, "utf8")) as {
    candidateConsensus?: string;
    consensus?: { outcome?: string; reached?: boolean; ratifiedBy?: string[]; blockedBy?: string[] };
    ratifications?: {
      member?: { name?: string; model?: string };
      vote?: { decision?: string; requiredEdits?: string; raw?: string };
      content?: string;
    }[];
    repair?: {
      revisedCandidate?: string;
      priorRatifications?: {
        member?: { name?: string; model?: string };
        vote?: { decision?: string; requiredEdits?: string; raw?: string };
        content?: string;
      }[];
    };
  };
  const candidate = previous.candidateConsensus || previous.repair?.revisedCandidate || "";
  const ratifications = [...(previous.repair?.priorRatifications || []), ...(previous.ratifications || [])];
  const requiredEdits = ratifications
    .filter((ratification) => ratification.vote?.decision === "accept_with_edits")
    .map((ratification, index) =>
      [
        `## Edit ${index + 1}: ${ratification.member?.name ?? "unknown"} (${ratification.member?.model ?? "unknown model"})`,
        ratification.vote?.requiredEdits || ratification.content || ratification.vote?.raw || "(none)",
      ].join("\n"),
    )
    .join("\n\n");

  return [
    "# Two-member agents-council repair request",
    "",
    "Topic: finalize the alternative proposal to `ecs350_ranns.md` for Tier 5 multiflow scheduling.",
    "",
    "The previous council generated a substantive alternative proposal but ended with `ACCEPT_WITH_EDITS`, not a material veto. Your task is to fold in the required edits and produce the final proposal artifact.",
    "",
    `Previous transcript JSON: ${previousPath}`,
    `Previous outcome: ${JSON.stringify(previous.consensus ?? {})}`,
    "",
    "Rules:",
    "- Do not reopen broad architecture debate unless a required edit exposes a real contradiction.",
    "- Incorporate every required edit below.",
    "- Preserve the alternative proposal's core architecture unless a required edit directly changes it.",
    "- Fix factual precision around ScientistOne: baseline systems, not ScientistOne, are the source of the hallucinated-reference failure rate language.",
    "- Define `G-budget` if the candidate references it, or remove that reference and replace it with an explicit B4/kill-list gate.",
    "- Return a complete standalone proposal, not a diff.",
    "- Ratification should accept if the artifact folds in the edits without introducing new factual claims.",
    "",
    "# Required edits from previous council",
    "",
    requiredEdits || "(none extracted)",
    "",
    "# Candidate alternative proposal to repair",
    "",
    candidate || "(missing candidate)",
    "",
    "# Required output shape",
    "",
    "Produce a complete alternative proposal with these sections:",
    "- Title and one-sentence thesis",
    "- What ECS3-50-RANSS gets right",
    "- What this proposal rejects from ECS3-50-RANSS",
    "- Core architecture",
    "- Release-path implementation plan",
    "- Exact/reference/oracle plan",
    "- Learned-shadow plan, if any",
    "- Evidence, certificate, and audit gates",
    "- Benchmark and ablation plan",
    "- Migration from current Tier 5 modules",
    "- Risks and failure modes",
    "- Kill list",
    "- Confidence and falsifiers",
  ].join("\n");
}

async function buildPrompt(mode: CouncilMode): Promise<string> {
  if (mode === "repair") {
    return buildRepairPrompt();
  }

  const [latest, ecs350, pro55, openrouter] = await Promise.all([
    readUtf8(files.latest),
    readUtf8(files.ecs350),
    readUtf8(files.pro55),
    readUtf8(files.openrouter),
  ]);
  const pdfs = [summarizePdf(files.pdfScientistOne), summarizePdf(files.pdfSelfRevising)];
  const openrouterSummary = summarizeMarkdown("OpenRouter Chat Fri Jun 05 2026.md", openrouter, 8);

  if (mode === "alternative") {
    return [
      "# Two-member agents-council request",
      "",
      "Topic: make an alternative proposal to `ecs350_ranns.md` for optimizing multiflow scheduling in Tier 5.",
      "",
      "You are a two-member model council. Work only from the evidence in this prompt. Do not browse, do not assume file access, and do not propose a greenfield system.",
      "",
      "Task: produce a serious competing proposal, not a review, summary, or small edit of `ecs350_ranns.md`.",
      "",
      "Hard constraints:",
      "- The proposal must explicitly disagree with or replace at least three material choices in `ecs350_ranns.md`.",
      "- The proposal must preserve what is correct about the substrate-first diagnosis if the evidence supports it.",
      "- The proposal must be implementation-sequenced against the current Tier 5 code substrate.",
      "- The proposal must distinguish production release path, exact/reference path, learned shadow path, and research-only path.",
      "- The proposal must define certificate/evidence gates before any learned component can affect release behavior.",
      "- The proposal must include a benchmark plan and a kill list.",
      "",
      "Design goal: give the user an alternative architecture they could implement instead of ECS3-50-RANSS. It should be narrower, sharper, and more falsifiable if that is warranted by the evidence.",
      "",
      implementationContext(),
      "",
      "# Baseline to compete against: ecs350_ranns.md",
      "",
      latest,
      "",
      "# Previous proposal summaries",
      "",
      summarizeMarkdown("ecs350.md", ecs350, 10),
      "",
      summarizeMarkdown("55pro_proposal.md", pro55, 10),
      "",
      openrouterSummary,
      "",
      "# Paper-derived evidence",
      "",
      pdfs.map(renderPdfSummary).join("\n\n"),
      "",
      "# Required proposal shape",
      "",
      "Produce a complete alternative proposal with these sections:",
      "- Title and one-sentence thesis",
      "- What ECS3-50-RANSS gets right",
      "- What this proposal rejects from ECS3-50-RANSS",
      "- Core architecture",
      "- Release-path implementation plan",
      "- Exact/reference/oracle plan",
      "- Learned-shadow plan, if any",
      "- Evidence, certificate, and audit gates",
      "- Benchmark and ablation plan",
      "- Migration from current Tier 5 modules",
      "- Risks and failure modes",
      "- Kill list",
      "- Confidence and falsifiers",
    ].join("\n");
  }

  return [
    "# Two-member agents-council request",
    "",
    "Topic: optimize multiflow scheduling in Tier 5.",
    "",
    "You are a two-member model council. Work only from the evidence in this prompt. Do not browse, do not assume file access, and do not propose a greenfield system.",
    "",
    "Required output: a concrete implementation recommendation for Tier 5 multiflow scheduling. It must distinguish release path, exact/reference path, learned shadow path, and longer-term schema-discovery path. It must rank steps by dependency order and name validation gates.",
    "",
    "Decision questions:",
    "1. Is `ecs350_ranns.md` directionally right, and what should be changed?",
    "2. What is the smallest correct implementation sequence to optimize Tier 5 multiflow scheduling?",
    "3. What should be implemented before any learned scheduler is trusted?",
    "4. Where, if anywhere, do FlowFold/RANSS/neural-symbolic components belong?",
    "5. What exact tests, benchmarks, certificates, and audit artifacts should gate promotion?",
    "6. What should explicitly not be built yet?",
    "",
    implementationContext(),
    "",
    "# Latest proposal: ecs350_ranns.md",
    "",
    latest,
    "",
    "# Previous proposal summaries",
    "",
    summarizeMarkdown("ecs350.md", ecs350, 10),
    "",
    summarizeMarkdown("55pro_proposal.md", pro55, 10),
    "",
    openrouterSummary,
    "",
    "# Paper-derived evidence",
    "",
    pdfs.map(renderPdfSummary).join("\n\n"),
    "",
    "# Output shape",
    "",
    "Produce the final recommendation as:",
    "- Verdict",
    "- Release-path implementation sequence",
    "- Exact/reference solver sequence",
    "- Learned shadow/RANSS sequence",
    "- Evidence/certificate/audit gates",
    "- Benchmark plan",
    "- Kill list: attractive ideas to defer",
    "- Confidence and what would change the recommendation",
  ].join("\n");
}

async function main(): Promise<void> {
  const mode = councilMode();
  if (!process.env.AGENTS_COUNCIL_MEMBERS) {
    process.env.AGENTS_COUNCIL_MEMBERS = "claude,chatgpt";
  }
  if (!process.env.AGENTS_COUNCIL_MAX_ROUNDS) {
    process.env.AGENTS_COUNCIL_MAX_ROUNDS = "6";
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const prompt = await buildPrompt(mode);
  await mkdir(SCHED_DIR, { recursive: true });

  const prefix = resultPrefix(mode);
  const promptPath = path.join(SCHED_DIR, `${prefix}_prompt_${stamp}.md`);
  const markdownPath = path.join(SCHED_DIR, `${prefix}_result_${stamp}.md`);
  const jsonPath = path.join(SCHED_DIR, `${prefix}_result_${stamp}.json`);

  await writeFile(promptPath, prompt, "utf8");

  if (process.argv.includes("--prompt-only")) {
    console.log(`prompt=${promptPath}`);
    console.log(`prompt_chars=${prompt.length}`);
    console.log("mode=prompt-only");
    return;
  }

  const startedAt = Date.now();
  const result: ModelCouncilResult = await runModelCouncil({ prompt });
  const markdown = [
    mode === "alternative"
      ? "# Tier 5 Multiflow Scheduling Alternative Proposal Council"
      : "# Tier 5 Multiflow Scheduling Agents Council",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${mode}`,
    `Members: ${result.members.map((member) => `${member.name} (${member.model})`).join(", ")}`,
    `Max rounds env: ${process.env.AGENTS_COUNCIL_MAX_ROUNDS}`,
    `Prompt: ${promptPath}`,
    `Elapsed ms: ${Date.now() - startedAt}`,
    "",
    formatModelCouncilMarkdown(result),
  ].join("\n");

  await writeFile(markdownPath, markdown, "utf8");
  await writeFile(jsonPath, JSON.stringify(result, null, 2), "utf8");

  console.log(`prompt=${promptPath}`);
  console.log(`markdown=${markdownPath}`);
  console.log(`json=${jsonPath}`);
  console.log(`outcome=${result.consensus.outcome}`);
  console.log(`consensus_reached=${result.consensus.reached}`);
  console.log(`rounds=${result.rounds.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});

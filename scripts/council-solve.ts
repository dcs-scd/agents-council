#!/usr/bin/env bun
/**
 * council-solve — run the model council on a prompt, inlining any local files
 * the prompt references.
 *
 * Why this exists: `bun run cli solve` passes the prompt text straight to the
 * peers. Three of the six council members (Kimi / DeepSeek / Gemini via
 * OpenRouter) are plain chat-completion models — they cannot read files off
 * disk. So a prompt like
 *
 *   "Use the v1 discovery process (/abs/novelty/v1.md) to evaluate
 *    /abs/redesign_backend_predictors/κ-CMA v0_imp_plan.md and propose ..."
 *
 * only works if the referenced files are embedded into the prompt. This wrapper
 * scans the prompt for local file paths, verifies they exist, and appends their
 * verbatim contents under an "## Attached files" section before calling the
 * council. Paths with spaces and non-ASCII characters (e.g. "κ-CMA v0_imp_plan.md")
 * are handled — detection is anchored on a known file extension and confirmed
 * against the filesystem, not on whitespace.
 *
 * Usage:
 *   bun scripts/council-solve.ts "Use v1 (/abs/v1.md) to review /abs/plan.md and propose X"
 *   bun scripts/council-solve.ts --json "..."          # full structured result as JSON
 *   bun scripts/council-solve.ts --dry-run "..."        # print expanded prompt, do NOT call the council
 *   bun scripts/council-solve.ts --max-bytes 1000000 "..."  # raise the per-file inline cap
 *   echo "long prompt with /abs/paths.md" | bun scripts/council-solve.ts   # prompt from stdin
 *
 * Requires the same runtime auth as `bun run cli solve`:
 *   OPENROUTER_API_KEY (Kimi/DeepSeek/Gemini), `codex login` (Codex), Claude auth (Opus).
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { formatModelCouncilMarkdown, runModelCouncil, saveModelCouncilRun } from "../src/core/services/modelCouncil";

const DEFAULT_MAX_BYTES = 500_000;

// File extensions we treat as inlinable text artifacts when scanning the prompt.
const INLINABLE_EXTENSIONS = [
  "md",
  "markdown",
  "txt",
  "rst",
  "org",
  "ts",
  "tsx",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "py",
  "scala",
  "sbt",
  "rs",
  "go",
  "java",
  "kt",
  "kts",
  "c",
  "h",
  "cc",
  "cpp",
  "hpp",
  "cu",
  "cuh",
  "rb",
  "swift",
  "cs",
  "php",
  "json",
  "jsonl",
  "yaml",
  "yml",
  "toml",
  "ini",
  "cfg",
  "conf",
  "env",
  "sh",
  "bash",
  "zsh",
  "sql",
  "csv",
  "tsv",
  "xml",
  "html",
  "css",
];

// Match an absolute (/...) or home (~/...) path that ends at one of the known
// extensions. Non-greedy so the match stops at the FIRST extension, which lets a
// filename contain spaces (e.g. "κ-CMA v0_imp_plan.md") without swallowing the
// following prose. Existence on disk is the real filter — see findReferencedFiles.
const PATH_RE = new RegExp(String.raw`(~?/[^\n\r]*?\.(?:${INLINABLE_EXTENSIONS.join("|")}))\b`, "g");

type ReferencedFile = {
  label: string; // path as written in the prompt
  abs: string; // resolved absolute path on disk
};

const expandHome = (candidate: string): string => {
  const home = process.env.HOME ?? "";
  if (candidate === "~") {
    return home;
  }
  if (candidate.startsWith("~/")) {
    return path.join(home, candidate.slice(2));
  }
  return candidate;
};

const findReferencedFiles = (prompt: string): ReferencedFile[] => {
  const seen = new Set<string>();
  const found: ReferencedFile[] = [];
  for (const match of prompt.matchAll(PATH_RE)) {
    const label = match[1];
    if (!label) {
      continue;
    }
    const candidates = [expandHome(label), path.resolve(process.cwd(), label)];
    for (const abs of candidates) {
      if (seen.has(abs)) {
        break;
      }
      try {
        if (existsSync(abs) && statSync(abs).isFile()) {
          seen.add(abs);
          found.push({ label, abs });
          break;
        }
      } catch {
        // Unreadable candidate — skip silently and try the next form.
      }
    }
  }
  return found;
};

// Pick a code-fence longer than any backtick run inside the content so the file
// body can never break out of its fence.
const chooseFence = (content: string): string => {
  let longest = 0;
  let current = 0;
  for (const ch of content) {
    if (ch === "`") {
      current += 1;
      if (current > longest) {
        longest = current;
      }
    } else {
      current = 0;
    }
  }
  return "`".repeat(Math.max(3, longest + 1));
};

type BuiltPrompt = {
  text: string;
  inlinedBytes: number;
};

const buildPrompt = (prompt: string, files: ReferencedFile[], maxBytes: number): BuiltPrompt => {
  if (files.length === 0) {
    return { text: prompt, inlinedBytes: 0 };
  }

  const parts: string[] = [
    prompt.trim(),
    "",
    "---",
    "",
    "## Attached files",
    "",
    "The local files referenced above are inlined below verbatim so every council member can read them directly.",
    "",
  ];

  let inlinedBytes = 0;
  for (const file of files) {
    let content = readFileSync(file.abs, "utf8");
    const size = Buffer.byteLength(content, "utf8");
    if (size > maxBytes) {
      content = `${content.slice(0, maxBytes)}\n\n[...truncated: ${file.label} is ${size} bytes, capped at ${maxBytes}. Re-run with --max-bytes to include more.]`;
    }
    inlinedBytes += Math.min(size, maxBytes);
    const lang = path.extname(file.abs).slice(1);
    const fence = chooseFence(content);
    parts.push(`### ${file.label}`, "", `${fence}${lang}`, content, fence, "");
  }

  return { text: parts.join("\n"), inlinedBytes };
};

type ParsedArgs = {
  prompt: string;
  json: boolean;
  dryRun: boolean;
  maxBytes: number;
};

const parseArgs = (argv: string[]): { promptParts: string[]; json: boolean; dryRun: boolean; maxBytes: number } => {
  let json = false;
  let dryRun = false;
  let maxBytes = DEFAULT_MAX_BYTES;
  const promptParts: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i] ?? "";
    if (arg === "--json") {
      json = true;
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--max-bytes") {
      const next = argv[i + 1];
      if (next === undefined) {
        throw new Error("--max-bytes expects a number");
      }
      maxBytes = Number(next);
      i += 1;
    } else if (arg.startsWith("--max-bytes=")) {
      maxBytes = Number(arg.slice("--max-bytes=".length));
    } else {
      promptParts.push(arg);
    }
  }

  if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
    throw new Error("--max-bytes expects a positive number");
  }

  return { promptParts, json, dryRun, maxBytes };
};

const resolvePrompt = async (promptParts: string[]): Promise<ParsedArgs["prompt"]> => {
  const fromArgs = promptParts.join(" ").trim();
  if (fromArgs) {
    return fromArgs;
  }
  // No positional prompt — fall back to stdin so the prompt can be piped in.
  if (!process.stdin.isTTY) {
    return (await Bun.stdin.text()).trim();
  }
  return "";
};

const main = async (): Promise<void> => {
  const { promptParts, json, dryRun, maxBytes } = parseArgs(process.argv.slice(2));
  const prompt = await resolvePrompt(promptParts);

  if (!prompt) {
    console.error("council-solve: no prompt given. Pass it as arguments or pipe it via stdin.");
    process.exit(1);
  }

  const files = findReferencedFiles(prompt);
  const { text, inlinedBytes } = buildPrompt(prompt, files, maxBytes);

  if (files.length > 0) {
    console.error(`council-solve: inlined ${files.length} file(s), ${inlinedBytes} bytes:`);
    for (const file of files) {
      console.error(`  • ${file.abs}`);
    }
  } else {
    console.error("council-solve: no existing local files detected in the prompt; sending it as-is.");
  }

  if (dryRun) {
    console.error("council-solve: --dry-run set, council NOT called. Expanded prompt follows on stdout.\n");
    console.log(text);
    return;
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error(
      "council-solve: warning — OPENROUTER_API_KEY is not set; the OpenRouter peers (Kimi/DeepSeek/Gemini) will fail.",
    );
  }

  const result = await runModelCouncil({ prompt: text });

  try {
    const saved = await saveModelCouncilRun(result);
    console.error(`Saved deliberation record to ${saved.jsonPath}`);
    console.error(`Saved Markdown answer to ${saved.markdownPath}`);
  } catch (saveError) {
    const detail = saveError instanceof Error ? saveError.message : String(saveError);
    console.error(`Warning: failed to save deliberation record: ${detail}`);
  }

  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(formatModelCouncilMarkdown(result));
};

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`council-solve failed: ${detail}`);
  process.exit(1);
});

#!/usr/bin/env bun
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Options = {
  inputDir: string;
  outputDir: string;
  suffix: string;
};

const DEFAULT_INPUT = "/home/dstefanescu/other_systems/o4/agents-council/harness/arxiviq_subscription_download/html";
const DEFAULT_OUTPUT =
  "/home/dstefanescu/other_systems/o4/agents-council/harness/arxiviq_subscription_download/html_static";

function usage(): string {
  return [
    "Usage: bun harness/make_arxiviq_static_html.ts [--input-dir <dir>] [--output-dir <dir>] [--suffix <suffix>]",
    "",
    "Creates local-viewable ArXivIQ HTML snapshots by stripping Substack scripts that can rewrite file:// pages.",
  ].join("\n");
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    inputDir: DEFAULT_INPUT,
    outputDir: DEFAULT_OUTPUT,
    suffix: ".static",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (!value) throw new Error(`Missing value for ${arg}`);
      return value;
    };

    if (arg === "--input-dir") options.inputDir = next();
    else if (arg === "--output-dir") options.outputDir = next();
    else if (arg === "--suffix") options.suffix = next();
    else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

function sanitizeHtml(html: string): string {
  const withoutScripts = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/\s(?:on[a-z]+)=("[^"]*"|'[^']*')/gi, "");

  const marker = [
    "<style>",
    "body { max-width: 860px; margin: 32px auto; padding: 0 20px; }",
    "img, video { max-width: 100%; height: auto; }",
    "pre, code { white-space: pre-wrap; }",
    "</style>",
  ].join("\n");

  return withoutScripts.includes("</head>")
    ? withoutScripts.replace("</head>", `${marker}\n</head>`)
    : `${marker}\n${withoutScripts}`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await mkdir(options.outputDir, { recursive: true });

  const files = (await readdir(options.inputDir))
    .filter((file) => file.endsWith(".html") && !file.endsWith(`${options.suffix}.html`))
    .sort();
  for (const file of files) {
    const inputPath = path.join(options.inputDir, file);
    const parsed = path.parse(file);
    const outputPath = path.join(options.outputDir, `${parsed.name}${options.suffix}${parsed.ext}`);
    const html = await readFile(inputPath, "utf8");
    await writeFile(outputPath, sanitizeHtml(html), "utf8");
  }

  console.log(`Wrote ${files.length} static HTML files to ${options.outputDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

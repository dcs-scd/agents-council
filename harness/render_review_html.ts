#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Options = {
  input: string;
  output: string;
  figures: string;
  assetsDir: string;
  python: string;
  inlineAssets: boolean;
};

type FigureSpec = {
  id: string;
  after: string;
  title: string;
  caption: string;
  kind?: "paper" | "concept";
  src?: string;
  pdf?: string;
  page?: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type RenderFigure = FigureSpec & {
  webSrc: string;
};

function usage(): string {
  return [
    "Usage: bun harness/render_review_html.ts --input <review.md> --output <review.html>",
    "",
    "Optional:",
    "  --figures <figures.json>     Embed representative figures",
    "  --assets-dir <dir>           Figure output directory",
    "  --python <path>              Python with PyMuPDF for PDF crops",
    "  --inline-assets              Embed figure images as base64 data URIs",
  ].join("\n");
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    input: "",
    output: "",
    figures: "",
    assetsDir: "",
    python: "harness/.venv-figures/bin/python",
    inlineAssets: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (!value) throw new Error(`Missing value for ${arg}`);
      return value;
    };
    if (arg === "--input") options.input = next();
    else if (arg === "--output") options.output = next();
    else if (arg === "--figures") options.figures = next();
    else if (arg === "--assets-dir") options.assetsDir = next();
    else if (arg === "--python") options.python = next();
    else if (arg === "--inline-assets") options.inlineAssets = true;
    else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else throw new Error(`Unknown option: ${arg}`);
  }
  if (!options.input || !options.output) throw new Error(usage());
  if (options.figures && !options.assetsDir) {
    const parsed = path.parse(options.output);
    options.assetsDir = path.join(parsed.dir, `${parsed.name}_assets`);
  }
  return options;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function inlineMarkup(value: string): string {
  return escapeHtml(value).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function isSection(line: string): boolean {
  return /^(TL;DR|Details|Limitations|Impact\b.*)$/i.test(line);
}

function isSubheading(line: string, next: string | undefined): boolean {
  if (!line || !next) return false;
  if (isSection(line)) return false;
  if (line.endsWith(".") || line.endsWith(":")) return false;
  if (line.length > 90) return false;
  return /^[A-Z0-9][A-Za-z0-9 ,&:;?()'’\-]+$/.test(line);
}

function nextNonEmpty(lines: string[], index: number): string | undefined {
  for (let i = index + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line) return line;
  }
  return undefined;
}

function figureHtml(figure: RenderFigure): string {
  const classes = ["paper-figure", figure.kind === "concept" ? "concept-figure" : ""].filter(Boolean).join(" ");
  return [
    `<figure class="${classes}">`,
    `<img src="${escapeHtml(figure.webSrc)}" alt="${escapeHtml(figure.title)}" loading="lazy" />`,
    "<figcaption>",
    `<strong>${inlineMarkup(figure.title)}</strong> ${inlineMarkup(figure.caption)}`,
    "</figcaption>",
    "</figure>",
  ].join("\n");
}

function mimeType(file: string): string {
  const extension = path.extname(file).toLowerCase();
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  return "image/png";
}

function resolveSpecPath(file: string, baseDir: string): string {
  return path.isAbsolute(file) ? file : path.resolve(baseDir, file);
}

function renderBody(lines: string[], figures: RenderFigure[]): string {
  const out: string[] = [];
  let paragraph: string[] = [];
  const remainingFigures = [...figures];

  const flush = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ");
    if (/^`[^`]+`$/.test(text)) out.push(`<div class="equation">${inlineMarkup(text.slice(1, -1))}</div>`);
    else if (/^(WHAT was done\?|WHY it matters\?|Executive summary:)/.test(text)) {
      const [label, ...rest] = text.split(/(?<=\?|:)\s/);
      out.push(`<p class="lede"><strong>${inlineMarkup(label)}</strong> ${inlineMarkup(rest.join(" "))}</p>`);
    } else {
      out.push(`<p>${inlineMarkup(text)}</p>`);
    }
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trim();
    const next = nextNonEmpty(lines, i);
    if (!line) {
      flush();
      continue;
    }
    if (isSection(line)) {
      flush();
      out.push(`<h2>${inlineMarkup(line)}</h2>`);
    } else if (isSubheading(line, next)) {
      flush();
      out.push(`<h3>${inlineMarkup(line)}</h3>`);
      const matches = remainingFigures.filter((figure) => figure.after === line);
      for (const figure of matches) out.push(figureHtml(figure));
      for (const figure of matches) {
        remainingFigures.splice(remainingFigures.indexOf(figure), 1);
      }
    } else {
      paragraph.push(line);
    }
  }
  flush();
  for (const figure of remainingFigures) out.push(figureHtml(figure));
  return out.join("\n");
}

function renderHtml(markdown: string, figures: RenderFigure[]): string {
  const lines = markdown.split(/\r?\n/);
  const title =
    lines
      .find((line) => line.startsWith("# "))
      ?.replace(/^#\s+/, "")
      .trim() || "Paper Review";
  const bodyStart = lines.findIndex((line) => line.trim() === "TL;DR");
  const metadataLines = lines.slice(1, bodyStart).filter((line) => /^[A-Za-z]+:/.test(line));
  const metadata = metadataLines
    .map((line) => {
      const index = line.indexOf(":");
      return `<div><dt>${inlineMarkup(line.slice(0, index))}</dt><dd>${inlineMarkup(line.slice(index + 1).trim())}</dd></div>`;
    })
    .join("\n");
  const body = renderBody(lines.slice(bodyStart), figures);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
:root {
  color-scheme: light;
  --bg: #fbfaf7;
  --paper: #fffdfa;
  --ink: #1d1a17;
  --muted: #746b60;
  --line: #e8dfd3;
  --accent: #cc5a1a;
  --accent-soft: #fff2e8;
  --code: #f3eee7;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  line-height: 1.68;
}
.shell {
  max-width: 840px;
  margin: 0 auto;
  padding: 56px 24px 72px;
}
article {
  background: var(--paper);
  border: 1px solid var(--line);
  padding: clamp(28px, 5vw, 58px);
  box-shadow: 0 24px 60px rgba(52, 38, 24, 0.08);
}
.eyebrow {
  color: var(--accent);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 14px;
}
h1 {
  margin: 0 0 22px;
  font-size: clamp(34px, 6vw, 58px);
  line-height: 1.04;
  font-weight: 760;
  letter-spacing: 0;
}
.meta {
  display: grid;
  gap: 8px;
  margin: 24px 0 38px;
  padding: 18px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
}
.meta div {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 16px;
}
dt {
  color: var(--muted);
  font-weight: 700;
}
dd {
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
}
h2 {
  margin: 44px 0 16px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 22px;
  line-height: 1.25;
  letter-spacing: 0;
}
h3 {
  margin: 34px 0 10px;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 18px;
  line-height: 1.35;
  letter-spacing: 0;
}
p {
  margin: 0 0 18px;
  font-size: 18px;
}
.lede {
  padding: 14px 16px;
  background: var(--accent-soft);
  border-left: 3px solid var(--accent);
}
code, .equation {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}
code {
  padding: 0.1em 0.32em;
  background: var(--code);
  border-radius: 4px;
  font-size: 0.86em;
}
.equation {
  margin: 18px 0 22px;
  padding: 16px;
  overflow-x: auto;
  background: var(--code);
  border: 1px solid var(--line);
  font-size: 15px;
}
.paper-figure {
  margin: 18px 0 30px;
  padding: 14px;
  background: #fff;
  border: 1px solid var(--line);
}
.paper-figure img {
  display: block;
  width: 100%;
  height: auto;
}
.paper-figure figcaption {
  margin-top: 10px;
  color: var(--muted);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  line-height: 1.45;
}
.paper-figure figcaption strong {
  color: var(--ink);
}
.concept-figure {
  margin-top: 22px;
  padding: 0;
  overflow: hidden;
}
.concept-figure img {
  background: #fffaf2;
}
.concept-figure figcaption {
  padding: 0 14px 14px;
}
@media (max-width: 640px) {
  .shell { padding: 24px 12px 40px; }
  article { padding: 24px 18px; border-left: 0; border-right: 0; }
  .meta div { grid-template-columns: 1fr; gap: 2px; }
  p { font-size: 17px; }
}
@media print {
  body { background: white; }
  .shell { max-width: none; padding: 0; }
  article { border: 0; box-shadow: none; }
}
</style>
</head>
<body>
<main class="shell">
<article>
<div class="eyebrow">ArXivIQ-style full review</div>
<h1>${inlineMarkup(title)}</h1>
<dl class="meta">
${metadata}
</dl>
${body}
</article>
</main>
</body>
</html>
`;
}

async function loadFigures(options: Options): Promise<RenderFigure[]> {
  if (!options.figures) return [];

  const specs = JSON.parse(await readFile(options.figures, "utf8")) as FigureSpec[];
  await mkdir(options.assetsDir, { recursive: true });
  const specBaseDir = path.dirname(path.resolve(options.figures));

  const extractedSpecs = specs.filter((spec) => spec.pdf && spec.page && spec.crop);
  if (extractedSpecs.length > 0) {
    const pythonCode = `
import fitz, json, pathlib, sys
specs = json.loads(sys.stdin.read())
for spec in specs:
    crop = spec["crop"]
    out = pathlib.Path(spec["output"])
    out.parent.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(spec["pdf"])
    page = doc[spec["page"] - 1]
    rect = fitz.Rect(crop["x"], crop["y"], crop["x"] + crop["width"], crop["y"] + crop["height"])
    pix = page.get_pixmap(matrix=fitz.Matrix(2.5, 2.5), clip=rect, alpha=False)
    pix.save(out)
`;
    const payload = extractedSpecs.map((spec) => ({
      pdf: spec.pdf,
      page: spec.page,
      crop: spec.crop,
      output: path.join(options.assetsDir, `${spec.id}.png`),
    }));
    execFileSync(options.python, ["-c", pythonCode], {
      input: JSON.stringify(payload),
      stdio: ["pipe", "pipe", "pipe"],
    });
  }

  return specs.map((spec) => {
    const src = spec.src ? resolveSpecPath(spec.src, specBaseDir) : path.join(options.assetsDir, `${spec.id}.png`);
    const webSrc = options.inlineAssets
      ? `data:${mimeType(src)};base64,${readFileSync(src).toString("base64")}`
      : path.relative(path.dirname(options.output), src).replaceAll(path.sep, "/");
    return {
      ...spec,
      webSrc,
    };
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const markdown = await readFile(options.input, "utf8");
  const figures = await loadFigures(options);
  await writeFile(options.output, renderHtml(markdown, figures), "utf8");
  console.log(`Wrote ${options.output}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

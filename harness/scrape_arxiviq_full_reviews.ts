#!/usr/bin/env bun
import { writeFile } from "node:fs/promises";
import path from "node:path";

type ArchivePost = {
  title?: string;
  slug?: string;
  canonical_url?: string;
  post_date?: string;
  audience?: string;
};

type FullReview = {
  title: string;
  postUrl: string;
  postDate: string | null;
  audience: string | null;
  authors: string | null;
  paper: string | null;
  code: string | null;
  model: string | null;
  tldr: string | null;
  fullReview: string | null;
  finalSection: string | null;
  paywallDetected: boolean;
  extractionWarnings: string[];
};

type Options = {
  archiveUrl: string;
  output: string;
  format: "markdown" | "json";
  limit: number | null;
  concurrency: number;
  includeWarnings: boolean;
};

const DEFAULT_ARCHIVE_URL = "https://arxiviq.substack.com/archive?sort=new";
const DEFAULT_OUTPUT = path.join(
  "/home/dstefanescu/other_systems/o4/agents-council/harness",
  "arxiviq_full_reviews_before_paywall.md",
);

function usage(): string {
  return [
    "Usage: bun harness/scrape_arxiviq_full_reviews.ts [options]",
    "",
    "Collects ArXivIQ paper reviews that are fully public before any Substack paywall gate.",
    "",
    "Options:",
    "  --archive-url <url>       Substack archive URL",
    "  --output <path>           Output file path",
    "  --format <markdown|json>  Output format, inferred from extension when omitted",
    "  --limit <n>               Max archive posts to fetch",
    "  --concurrency <n>         Parallel post fetches, default 4",
    "  --include-warnings        Include skipped-post warnings in JSON output",
    "  --help                    Show this help",
  ].join("\n");
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    archiveUrl: DEFAULT_ARCHIVE_URL,
    output: DEFAULT_OUTPUT,
    format: "markdown",
    limit: null,
    concurrency: 4,
    includeWarnings: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (!value) throw new Error(`Missing value for ${arg}`);
      return value;
    };

    if (arg === "--archive-url") options.archiveUrl = next();
    else if (arg === "--output") options.output = next();
    else if (arg === "--format") {
      const value = next();
      if (value !== "markdown" && value !== "json") throw new Error("--format must be markdown or json");
      options.format = value;
    } else if (arg === "--limit") {
      const value = Number.parseInt(next(), 10);
      if (!Number.isFinite(value) || value <= 0) throw new Error("--limit must be a positive integer");
      options.limit = value;
    } else if (arg === "--concurrency") {
      const value = Number.parseInt(next(), 10);
      if (!Number.isFinite(value) || value <= 0) throw new Error("--concurrency must be a positive integer");
      options.concurrency = Math.min(value, 8);
    } else if (arg === "--include-warnings") options.includeWarnings = true;
    else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else throw new Error(`Unknown option: ${arg}`);
  }

  if (options.output.endsWith(".json") && !argv.includes("--format")) options.format = "json";
  return options;
}

function archiveApiUrl(archiveUrl: string, offset: number, limit: number): string {
  const parsed = new URL(archiveUrl);
  const api = new URL("/api/v1/archive", `${parsed.protocol}//${parsed.host}`);
  api.searchParams.set("sort", parsed.searchParams.get("sort") || "new");
  api.searchParams.set("offset", String(offset));
  api.searchParams.set("limit", String(limit));
  return api.toString();
}

function publicationBaseUrl(archiveUrl: string): string {
  const parsed = new URL(archiveUrl);
  return `${parsed.protocol}//${parsed.host}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "agents-council-arxiviq-full-review-scraper/1.0",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return (await response.json()) as T;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "agents-council-arxiviq-full-review-scraper/1.0",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return await response.text();
}

async function getArchivePosts(options: Options): Promise<ArchivePost[]> {
  const posts: ArchivePost[] = [];
  const batchSize = 12;

  for (let offset = 0; ; offset += batchSize) {
    const remaining = options.limit == null ? batchSize : Math.min(batchSize, options.limit - posts.length);
    if (remaining <= 0) break;

    const data = await fetchJson<ArchivePost[]>(archiveApiUrl(options.archiveUrl, offset, remaining));
    if (!Array.isArray(data) || data.length === 0) break;
    posts.push(...data);
    if (data.length < remaining) break;
  }

  return posts;
}

function decodeHtmlEntities(input: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
    rsquo: "'",
    lsquo: "'",
    rdquo: '"',
    ldquo: '"',
    ndash: "-",
    mdash: "-",
    hellip: "...",
  };
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_match, entity: string) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return named[entity] ?? `&${entity};`;
  });
}

function htmlToText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "\n")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "\n")
      .replace(/<(br|p|div|li|h[1-6]|section|article|blockquote|tr)\b[^>]*>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|section|article|blockquote|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

function nonEmptyLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeFieldUrl(rawUrl: string, baseUrl: string): string {
  const absoluteUrl = new URL(decodeHtmlEntities(rawUrl), baseUrl).toString();
  const parsed = new URL(absoluteUrl);
  const redirectedUrl = parsed.searchParams.get("url") || parsed.searchParams.get("target");
  return redirectedUrl ? decodeURIComponent(redirectedUrl) : absoluteUrl;
}

function firstMatch(text: string, label: string): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`(?:^|\\n)${escaped}:\\s*([^\\n]+)`, "i"));
  if (!match) return null;
  return match[1].replace(/\s+/g, " ").trim() || null;
}

function extractHtmlField(html: string, text: string, label: string, baseUrl: string): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<strong\\b[^>]*>\\s*${escaped}\\s*<\\/strong>\\s*(?:<span\\b[^>]*>\\s*:\\s*<\\/span>|:)\\s*([\\s\\S]*?)(?:<br\\s*\\/?>|<\\/p>|<\\/div>)`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;

    const segment = match[1];
    const href = segment.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/i);
    if (href) return normalizeFieldUrl(href[1], baseUrl);

    const value = htmlToText(segment).replace(/\s+/g, " ").trim();
    if (value) return value;
  }

  return firstMatch(text, label);
}

function hasPaywallGate(text: string): boolean {
  return /Continue reading this post for free|Claim my free post|Or purchase a paid subscription|This post is for paid subscribers/i.test(
    text,
  );
}

function isBoilerplateLine(line: string): boolean {
  return /^(ArXivIQ is a reader-supported publication|Thanks for reading ArXivIQ|Subscribe for free|Hit Subscribe|Share|Comments?|Discussion|Recommendations?|Start your Substack|Get the app|Substack is the home|Privacy|Terms|Collection notice|© 20\d\d|If you'd like a taste|If you’d like a taste|What's next\?|What’s next\?|Launch cadence:|Reader polls:|Meta-posts:)/i.test(
    line,
  );
}

function extractTldr(lines: string[]): string | null {
  const start = lines.findIndex((line) => /^TL;?DR$/i.test(line) || /^TL;?DR\b/i.test(line));
  if (start === -1) return null;

  const parts: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^(Details|Continue reading|Share|Subscribe|Comments?|Discussion|Recommendations?)\b/i.test(line)) break;
    if (isBoilerplateLine(line)) break;
    parts.push(line);
  }

  return parts.length > 0 ? parts.join("\n") : null;
}

function extractFullReview(text: string): string | null {
  const lines = nonEmptyLines(text);
  const start = lines.findIndex((line) => /^TL;?DR$/i.test(line) || /^TL;?DR\b/i.test(line));
  if (start === -1) return null;

  const body: string[] = [];
  for (const line of lines.slice(start)) {
    if (/^Continue reading this post for free/i.test(line)) break;
    if (isBoilerplateLine(line)) break;
    body.push(line);
  }

  return body.length > 0 ? body.join("\n") : null;
}

function isReviewSectionHeading(line: string): boolean {
  return /^(TL;DR|Details|Impact\b.*|Conclusion (?:and|&) Impact|Conclusion|Limitations|Takeaways|Future Directions|Overall Assessment)\b/i.test(
    line,
  );
}

function finalReviewSection(reviewText: string | null): string | null {
  if (!reviewText) return null;

  let finalSection: string | null = null;
  for (const line of nonEmptyLines(reviewText)) {
    if (isReviewSectionHeading(line)) finalSection = line;
  }
  return finalSection;
}

function normalizeUrl(url: string | undefined, baseUrl: string, slug: string | undefined): string {
  if (url) return url;
  if (slug) return `${baseUrl}/p/${slug}`;
  throw new Error("Archive post missing canonical_url and slug");
}

async function extractReview(post: ArchivePost, baseUrl: string): Promise<FullReview> {
  const postUrl = normalizeUrl(post.canonical_url, baseUrl, post.slug);
  const warnings: string[] = [];

  try {
    const html = await fetchText(postUrl);
    const text = htmlToText(html);
    const lines = nonEmptyLines(text);
    const fullReview = extractFullReview(text);
    const review: FullReview = {
      title: post.title || "Untitled",
      postUrl,
      postDate: post.post_date || null,
      audience: post.audience || null,
      authors: extractHtmlField(html, text, "Authors", postUrl),
      paper: extractHtmlField(html, text, "Paper", postUrl),
      code: extractHtmlField(html, text, "Code", postUrl),
      model: extractHtmlField(html, text, "Model", postUrl),
      tldr: extractTldr(lines),
      fullReview,
      finalSection: finalReviewSection(fullReview),
      paywallDetected: hasPaywallGate(text),
      extractionWarnings: warnings,
    };

    for (const field of ["authors", "paper", "tldr", "fullReview"] as const) {
      if (!review[field]) warnings.push(`missing ${field}`);
    }
    if (review.paywallDetected) warnings.push("paywall gate detected");
    if (review.audience !== "everyone") warnings.push(`non-public audience: ${review.audience ?? "unknown"}`);
    if (!review.finalSection || !/\bImpact\b/i.test(review.finalSection)) {
      warnings.push(`final section is not Impact: ${review.finalSection ?? "unknown"}`);
    }
    return review;
  } catch (error) {
    return {
      title: post.title || "Untitled",
      postUrl,
      postDate: post.post_date || null,
      audience: post.audience || null,
      authors: null,
      paper: null,
      code: null,
      model: null,
      tldr: null,
      fullReview: null,
      finalSection: null,
      paywallDetected: true,
      extractionWarnings: [`fetch/extract failed: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

function isFullyPublicPaperReview(review: FullReview): boolean {
  return Boolean(
    review.audience === "everyone" &&
      !review.paywallDetected &&
      review.authors &&
      review.paper &&
      review.tldr &&
      review.fullReview &&
      review.finalSection &&
      /\bImpact\b/i.test(review.finalSection),
  );
}

async function mapConcurrent<T, U>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<U>,
): Promise<U[]> {
  const results = new Array<U>(items.length);
  let nextIndex = 0;

  async function worker() {
    for (;;) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) break;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function renderMarkdown(reviews: FullReview[], sourceUrl: string, scanned: number): string {
  const lines = [
    "# ArXivIQ Full Public Paper Reviews",
    "",
    `Source: ${sourceUrl}`,
    `Generated: ${new Date().toISOString()}`,
    `Archive posts scanned: ${scanned}`,
    `Fully public paper reviews ending with Impact: ${reviews.length}`,
    "",
    'Selection rule: `audience === "everyone"`, required paper metadata present, no Substack continuation/paywall gate detected in rendered article text, and final detected review section contains `Impact`.',
    "",
  ];

  for (const review of reviews) {
    lines.push(`## ${review.title}`, "");
    lines.push(`Post: ${review.postUrl}`);
    lines.push(`Date: ${review.postDate ?? "N/A"}`);
    lines.push(`Authors: ${review.authors ?? "N/A"}`);
    lines.push(`Paper: ${review.paper ?? "N/A"}`);
    lines.push(`Code: ${review.code ?? "N/A"}`);
    lines.push(`Model: ${review.model ?? "N/A"}`);
    lines.push(`Final section: ${review.finalSection ?? "N/A"}`);
    lines.push("", "### Full review", "");
    lines.push(review.fullReview ?? "N/A");
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const baseUrl = publicationBaseUrl(options.archiveUrl);

  console.log(`Fetching archive: ${options.archiveUrl}`);
  const posts = await getArchivePosts(options);
  console.log(`Found ${posts.length} archive posts`);

  const reviews = await mapConcurrent(posts, options.concurrency, (post, index) => {
    console.log(`Fetching ${index + 1}/${posts.length}: ${post.title || post.slug || "Untitled"}`);
    return extractReview(post, baseUrl);
  });

  const publicReviews = reviews.filter(isFullyPublicPaperReview);
  const skipped = reviews.filter((review) => !isFullyPublicPaperReview(review));

  const body =
    options.format === "json"
      ? `${JSON.stringify(
          {
            source: options.archiveUrl,
            generatedAt: new Date().toISOString(),
            archivePostsScanned: posts.length,
            count: publicReviews.length,
            reviews: publicReviews,
            skipped: options.includeWarnings
              ? skipped.map((review) => ({
                  title: review.title,
                  postUrl: review.postUrl,
                  audience: review.audience,
                  warnings: review.extractionWarnings,
                }))
              : undefined,
          },
          null,
          2,
        )}\n`
      : renderMarkdown(publicReviews, options.archiveUrl, posts.length);

  await writeFile(options.output, body, "utf8");
  console.log(`Wrote ${publicReviews.length} fully public paper reviews to ${options.output}`);
  console.log(`Skipped ${skipped.length} posts that were gated, incomplete, or not paper reviews`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

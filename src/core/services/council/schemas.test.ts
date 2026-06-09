import { afterEach, describe, expect, test } from "bun:test";

import {
  ClaimSchema,
  DeliberationResponseSchema,
  RatificationVoteSchema,
  getParseFailStats,
  parseStructuredOrFallback,
  resetParseFailStats,
  schemaSelfTest,
} from "./schemas";

afterEach(() => {
  resetParseFailStats();
});

describe("WU-B1 structured schemas", () => {
  // Evidence (a): a valid structured payload parses to the typed object.
  test("(a) valid structured Claim payload parses to typed object", () => {
    const payload = {
      id: "c1",
      text: "the build script compiles the CLI",
      provenance: "repo_fact",
      evidence: ["package.json:build"],
      severity: "low",
    };
    const result = ClaimSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.provenance).toBe("repo_fact");
      expect(result.data.evidence).toEqual(["package.json:build"]);
      expect(result.data.severity).toBe("low");
    }
  });

  test("(a) valid RatificationVote payload parses", () => {
    const result = RatificationVoteSchema.safeParse({ decision: "block", blockKind: "FACTUAL_ERROR" });
    expect(result.success).toBe(true);
  });

  // Evidence (b): a malformed structured payload falls through to the legacy
  // text parser AND increments the parse-fail counter.
  test("(b) malformed payload falls back to text parser and increments fail counter", () => {
    resetParseFailStats();
    let fallbackArg = "";
    const fallback = (raw: string) => {
      fallbackArg = raw;
      return { legacy: true } as const;
    };

    // Invalid JSON -> fallback.
    const notJson = "CANDIDATE_CONSENSUS: ship it";
    const r1 = parseStructuredOrFallback(notJson, DeliberationResponseSchema, fallback);
    expect(r1).toEqual({ legacy: true });
    expect(fallbackArg).toBe(notJson);

    // Schema-invalid JSON -> fallback.
    const badShape = JSON.stringify({ provenance: "nope" });
    const r2 = parseStructuredOrFallback(badShape, DeliberationResponseSchema, fallback);
    expect(r2).toEqual({ legacy: true });

    const stats = getParseFailStats();
    expect(stats.attempted).toBe(2);
    expect(stats.failed).toBe(2);
    expect(stats.rate).toBe(1);
  });

  test("(b) valid structured JSON does NOT increment the fail counter", () => {
    resetParseFailStats();
    const valid = JSON.stringify({ candidateConsensus: "ship it", claims: [] });
    const fallback = () => ({ legacy: true }) as const;
    const r = parseStructuredOrFallback(valid, DeliberationResponseSchema, fallback);
    expect(r).toEqual({ candidateConsensus: "ship it", claims: [] });
    const stats = getParseFailStats();
    expect(stats.attempted).toBe(1);
    expect(stats.failed).toBe(0);
    expect(stats.rate).toBe(0);
  });

  // gate_zod_bundled smoke (also exercised from the compiled binary separately).
  test("schemaSelfTest passes (Zod evaluable)", () => {
    expect(schemaSelfTest().startsWith("SELFTEST PASS")).toBe(true);
  });
});

// Evidence (c): the flag-off legacy path never imports/evaluates the schema
// module. Run a subprocess with AGENTS_COUNCIL_STRUCTURED unset that imports
// modelCouncil and calls the structured wrapper; assert the schema module's
// top-level load marker stays undefined (the module was never loaded).
describe("WU-B1 flag-off schema-module isolation (gate_schema_fallback (c))", () => {
  test("(c) flag-off structured wrapper does not load the schema module", async () => {
    const script = `
import { parseRatificationVoteStructured } from "./src/core/services/modelCouncil.ts";
const before = globalThis.__AGENTS_COUNCIL_SCHEMAS_LOADED__;
const vote = await parseRatificationVoteStructured("CONSENSUS: ACCEPT");
const after = globalThis.__AGENTS_COUNCIL_SCHEMAS_LOADED__;
console.log(JSON.stringify({ before: before ?? null, after: after ?? null, decision: vote.decision }));
`;
    const flagOffEnv: Record<string, string | undefined> = { ...process.env };
    delete flagOffEnv.AGENTS_COUNCIL_STRUCTURED;
    const proc = Bun.spawn(["bun", "-e", script], {
      cwd: process.cwd(),
      env: flagOffEnv,
      stdout: "pipe",
      stderr: "pipe",
    });
    const [out, err, code] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);
    expect(code).toBe(0);
    const line = out.trim().split("\n").pop() ?? "{}";
    const parsed = JSON.parse(line) as { before: unknown; after: unknown; decision: string };
    // The legacy parser ran (byte-for-byte ACCEPT) ...
    expect(parsed.decision).toBe("accept");
    // ... and the schema module was never evaluated, with the flag off.
    expect(parsed.before).toBeNull();
    expect(parsed.after).toBeNull();
    if (code !== 0) {
      console.error(err);
    }
  });

  test("(c-positive) flag-on path DOES load the schema module", async () => {
    const script = `
import { parseRatificationVoteStructured } from "./src/core/services/modelCouncil.ts";
await parseRatificationVoteStructured("CONSENSUS: ACCEPT");
console.log(JSON.stringify({ loaded: globalThis.__AGENTS_COUNCIL_SCHEMAS_LOADED__ ?? null }));
`;
    const proc = Bun.spawn(["bun", "-e", script], {
      cwd: process.cwd(),
      env: { ...process.env, AGENTS_COUNCIL_STRUCTURED: "1" },
      stdout: "pipe",
      stderr: "pipe",
    });
    const [out, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
    expect(code).toBe(0);
    const line = out.trim().split("\n").pop() ?? "{}";
    const parsed = JSON.parse(line) as { loaded: unknown };
    expect(parsed.loaded).toBe(true);
  });
});

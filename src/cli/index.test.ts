import { describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

// End-to-end CLI coverage for `council solve` (Lane C1): --file input, --members
// override, the both/neither error cases, and the stderr start banner. Each run
// spawns the real CLI as a subprocess and drives the council through the existing
// mock-OpenRouter transport seam (AGENTS_COUNCIL_OPENROUTER_URL) with a single
// `kimi` reviewer, so no real model CLI is ever summoned.

const CLI = path.join(import.meta.dir, "index.ts");
const REPO_ROOT = path.join(import.meta.dir, "..", "..");

async function packageVersion(): Promise<string> {
  const pkg = await Bun.file(path.join(REPO_ROOT, "package.json")).json();
  return pkg.version as string;
}

// A mock OpenRouter server returning canned council replies in call order:
// proposal, deliberation (emits the shared candidate), ratify (ACCEPT). With
// AGENTS_COUNCIL_MAX_ROUNDS=1 a single-member run reaches a ratified consensus in
// exactly those three calls. Captured request bodies let a caller assert that the
// resolved prompt reached the transport.
function startMockCouncil() {
  const canned = [
    "Initial independent answer to the prompt.",
    "Critique of the proposal.\nCANDIDATE_CONSENSUS:\nThe council recommends option A for the stated question.",
    "CONSENSUS: ACCEPT\nThe candidate is sound.",
  ];
  const bodies: string[] = [];
  let callIndex = 0;
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      bodies.push(await request.text());
      const content = canned[callIndex] ?? canned[canned.length - 1];
      callIndex += 1;
      return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
        headers: { "Content-Type": "application/json" },
      });
    },
  });
  return { server, bodies, url: server.url.toString() };
}

type SolveResult = { stdout: string; stderr: string; exitCode: number };

async function runSolve(args: string[], overrides: Record<string, string>): Promise<SolveResult> {
  const proc = Bun.spawn({
    cmd: ["bun", CLI, "solve", ...args],
    env: { ...process.env, ...overrides },
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { stdout, stderr, exitCode };
}

// Shared transport/env for the mock happy-path runs. The concrete roster is set
// per test (env vs --members) so both roster-resolution paths are exercised.
function mockEnv(url: string, delibDir: string): Record<string, string> {
  return {
    AGENTS_COUNCIL_OPENROUTER_URL: url,
    OPENROUTER_API_KEY: "test-key",
    AGENTS_COUNCIL_DIRECT_VENDOR_KEYS: "",
    AGENTS_COUNCIL_MAX_ROUNDS: "1",
    AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS: "5000",
    AGENTS_COUNCIL_STRUCTURED: "",
    AGENTS_COUNCIL_DELIBERATIONS_DIR: delibDir,
  };
}

describe("council solve CLI", () => {
  test("--file reads the prompt from a file and passes it straight to the council", async () => {
    const mock = startMockCouncil();
    const dir = await mkdtemp(path.join(tmpdir(), "council-cli-file-"));
    const delibDir = await mkdtemp(path.join(tmpdir(), "council-cli-delib-"));
    const promptFile = path.join(dir, "prompt.txt");
    const marker = "UNIQUE_FILE_PROMPT_MARKER_42";
    await writeFile(promptFile, `${marker}: which option should the council pick?`, "utf8");
    const version = await packageVersion();

    try {
      const result = await runSolve(["--file", promptFile], {
        ...mockEnv(mock.url, delibDir),
        AGENTS_COUNCIL_MEMBERS: "kimi",
      });

      expect(result.exitCode).toBe(0);
      // The file's prompt reached the transport verbatim (not truncated, not $(cat)).
      expect(mock.bodies.some((body) => body.includes(marker))).toBe(true);
      // Consensus answer is rendered to stdout.
      expect(result.stdout).toContain("# Council Consensus");
      expect(result.stdout).toContain("option A");
      // Banner on stderr surfaces roster, version, max rounds, and the resolved dir.
      expect(result.stderr).toContain("council solve: roster=kimi");
      expect(result.stderr).toContain(`version=${version}`);
      expect(result.stderr).toContain("maxRounds=1");
      expect(result.stderr).toContain(`deliberations=${delibDir}`);
    } finally {
      mock.server.stop(true);
      await rm(dir, { recursive: true, force: true });
      await rm(delibDir, { recursive: true, force: true });
    }
  });

  test("--members overrides AGENTS_COUNCIL_MEMBERS for the run", async () => {
    const mock = startMockCouncil();
    const delibDir = await mkdtemp(path.join(tmpdir(), "council-cli-delib-"));
    try {
      const result = await runSolve(["solve the tiling question", "--members", "kimi"], {
        ...mockEnv(mock.url, delibDir),
        // Ambient env asks for a different (CLI-provider) roster; the explicit
        // flag must win, so the run resolves to kimi and reaches the mock.
        AGENTS_COUNCIL_MEMBERS: "claude,chatgpt",
      });

      expect(result.exitCode).toBe(0);
      expect(result.stderr).toContain("council solve: roster=kimi");
      expect(mock.bodies.length).toBeGreaterThan(0);
    } finally {
      mock.server.stop(true);
      await rm(delibDir, { recursive: true, force: true });
    }
  });

  test("passing both a prompt argument and --file is a clear error", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "council-cli-both-"));
    const promptFile = path.join(dir, "prompt.txt");
    await writeFile(promptFile, "a file prompt", "utf8");
    try {
      const result = await runSolve(["an argv prompt", "--file", promptFile], {});
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("not both");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("passing neither a prompt argument nor --file is a clear error", async () => {
    const result = await runSolve([], {});
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Provide a prompt");
  });
});

import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  __setTestMemberAsker,
  resolveMemberTimeoutMs,
  runModelCouncil,
  saveModelCouncilFailure,
  withMemberTimeout,
  type ModelCouncilMember,
  type ModelCouncilResult,
  type TestMemberAsker,
} from "./modelCouncil";

// Lane B — resilience + run economics (B1 timeouts, B2 never-lose-work, B3
// member-drop degradation, B4 cost/latency ledger, B5 brief-size precheck). These
// drive the real runModelCouncil through the dependency-injected asker seam
// (__setTestMemberAsker) so degradation/timeout/checkpoint/ledger behavior is
// exercised deterministically without real provider CLIs. The default roster
// (claude/chatgpt/gemini) is used because those providers need no API key at
// config-validation time; the injected asker replaces the actual provider calls.

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Env keys these tests mutate; snapshot + restore so nothing leaks between tests
// or into sibling files that share the process.
const TOUCHED_ENV = [
  "AGENTS_COUNCIL_MEMBERS",
  "AGENTS_COUNCIL_MEMBER_TIMEOUT_MS",
  "AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS",
  "AGENTS_COUNCIL_MAX_ROUNDS",
  "AGENTS_COUNCIL_DELIBERATIONS_DIR",
  "AGENTS_COUNCIL_DROP_OVERSIZED",
  "AGENTS_COUNCIL_CONTEXT_TOKENS_CLAUDE",
  "AGENTS_COUNCIL_CONTEXT_TOKENS_CHATGPT",
  "AGENTS_COUNCIL_CONTEXT_TOKENS_GEMINI",
] as const;
const priorEnv = new Map(TOUCHED_ENV.map((key) => [key, process.env[key]]));

afterEach(() => {
  // Critical: clear the injection seam so it never leaks into other test files.
  __setTestMemberAsker(null);
  for (const [key, value] of priorEnv) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

// A canned asker: converging deliberation candidate + ACCEPT ratification, with a
// per-(member,phase) override so a specific member can be made to fail or hang.
function cannedAsker(
  overrides: Partial<Record<string, (member: ModelCouncilMember, phase: string) => Promise<string>>> = {},
): TestMemberAsker {
  return async (member, _messages, phase, _round) => {
    const key = `${member.id}:${phase}`;
    const override = overrides[key] ?? overrides[phase];
    if (override) {
      return override(member, phase);
    }
    // Small non-zero delay so ledger wallMs is provably > 0.
    await delay(3);
    if (phase === "proposal") {
      return `PROPOSAL from ${member.name}`;
    }
    if (phase === "deliberation") {
      return "CONSENSUS_STATUS: CONVERGED\nMATERIAL_DISAGREEMENTS: NONE\nCANDIDATE_CONSENSUS:\nShared plan: adopt option A.";
    }
    if (phase === "ratification") {
      return "CONSENSUS: ACCEPT\nEndorsed.";
    }
    // synthesis (repair) — unused on the happy paths here.
    return "CANDIDATE_CONSENSUS:\nShared plan: adopt option A.";
  };
}

async function withTempDeliberationsDir<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(path.join(tmpdir(), "council-laneB-"));
  process.env.AGENTS_COUNCIL_DELIBERATIONS_DIR = dir;
  try {
    return await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe("B1 — per-member timeout on every provider path", () => {
  const member: ModelCouncilMember = { id: "gemini", name: "Gemini 3.5 Flash", provider: "gemini", model: "g" };

  test("withMemberTimeout rejects a never-resolving call, naming the member and the elapsed budget", async () => {
    await expect(withMemberTimeout(member, 20, () => new Promise<string>(() => {}))).rejects.toThrow(
      /Gemini 3\.5 Flash.*gemini.*timed out after 20ms/,
    );
  });

  test("resolveMemberTimeoutMs precedence: MEMBER_TIMEOUT_MS > OPENROUTER alias > default; sub-min falls back", () => {
    process.env.AGENTS_COUNCIL_MEMBER_TIMEOUT_MS = "1234";
    process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS = "50";
    expect(resolveMemberTimeoutMs()).toBe(1234);

    delete process.env.AGENTS_COUNCIL_MEMBER_TIMEOUT_MS;
    process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS = "77";
    expect(resolveMemberTimeoutMs()).toBe(77); // legacy alias honored

    delete process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS;
    expect(resolveMemberTimeoutMs()).toBe(300_000); // default

    process.env.AGENTS_COUNCIL_MEMBER_TIMEOUT_MS = "10"; // below the 50ms floor
    expect(resolveMemberTimeoutMs()).toBe(300_000);
  });

  test("an injected asker that never resolves times out at AGENTS_COUNCIL_MEMBER_TIMEOUT_MS, dropped and named", async () => {
    await withTempDeliberationsDir(async () => {
      process.env.AGENTS_COUNCIL_MEMBERS = "claude,chatgpt,gemini";
      process.env.AGENTS_COUNCIL_MEMBER_TIMEOUT_MS = "50";
      process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";
      __setTestMemberAsker(
        cannedAsker({
          "gemini:proposal": () => new Promise<string>(() => {}), // never resolves -> timeout
        }),
      );

      const result = await runModelCouncil({ prompt: "resilience: timeout drop" });

      // Gemini timed out in round-0 proposals -> dropped, run continued degraded.
      expect(result.degraded).toBe(true);
      const geminiDrop = result.droppedMembers?.find((drop) => drop.id === "gemini");
      expect(geminiDrop).toBeDefined();
      expect(geminiDrop?.reason).toMatch(/timed out after 50ms/);
      expect(result.consensus.outcome).toBe("ratified");
    });
  });
});

describe("B3 — member-drop degradation with survivor quorum", () => {
  test("a 3-member run where one asker rejects mid-deliberation completes degraded over the 2 survivors", async () => {
    await withTempDeliberationsDir(async () => {
      process.env.AGENTS_COUNCIL_MEMBERS = "claude,chatgpt,gemini";
      process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";
      __setTestMemberAsker(
        cannedAsker({
          "gemini:deliberation": () => Promise.reject(new Error("gemini deliberation blew up")),
        }),
      );

      const result = await runModelCouncil({ prompt: "resilience: degrade to survivors" });

      expect(result.degraded).toBe(true);
      expect(result.droppedMembers).toHaveLength(1);
      expect(result.droppedMembers?.[0]?.id).toBe("gemini");
      expect(result.droppedMembers?.[0]?.phase).toBe("deliberation");
      expect(result.droppedMembers?.[0]?.round).toBe(1);
      // Ratification unanimity is over the 2 survivors only.
      expect(result.ratifications).toHaveLength(2);
      expect(result.consensus.outcome).toBe("ratified");
      expect(result.consensus.ratifiedBy).toHaveLength(2);
      expect(result.consensus.ratifiedBy).not.toContain("Gemini 3.5 Flash");
    });
  });

  test("a 2-member run where one fails loses quorum, and the failure record salvages the completed proposal round verbatim", async () => {
    await withTempDeliberationsDir(async () => {
      process.env.AGENTS_COUNCIL_MEMBERS = "claude,chatgpt";
      process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";
      __setTestMemberAsker(
        cannedAsker({
          "claude:proposal": () => Promise.resolve("PROPOSAL-CLAUDE-VERBATIM-42"),
          "chatgpt:proposal": () => Promise.resolve("PROPOSAL-CHATGPT-VERBATIM-99"),
          "chatgpt:deliberation": () => Promise.reject(new Error("chatgpt deliberation blew up")),
        }),
      );

      // Only 1 survivor after the deliberation drop -> the run fails.
      await expect(runModelCouncil({ prompt: "resilience: lose quorum" })).rejects.toThrow(/lost quorum/);

      // The CLI/MCP failure path passes only {prompt, error}; the enriched record is
      // reconstructed from the crash-insurance checkpoint the failed run left behind.
      const { jsonPath } = await saveModelCouncilFailure({
        prompt: "resilience: lose quorum",
        error: "Council lost quorum during deliberation",
      });
      const failure = JSON.parse(await readFile(jsonPath, "utf8"));

      // The completed proposal round is preserved verbatim.
      const raw = JSON.stringify(failure);
      expect(raw).toContain("PROPOSAL-CLAUDE-VERBATIM-42");
      expect(raw).toContain("PROPOSAL-CHATGPT-VERBATIM-99");
      expect(failure.completedPhases.some((p: { phase: string }) => p.phase === "proposal")).toBe(true);
      // The drop is recorded too.
      expect(failure.droppedMembers.some((d: { id: string }) => d.id === "chatgpt")).toBe(true);
    });
  });
});

describe("B2 — partial checkpoint crash insurance", () => {
  test("the partial jsonl exists mid-run and is removed after a successful run", async () => {
    await withTempDeliberationsDir(async (dir) => {
      process.env.AGENTS_COUNCIL_MEMBERS = "claude,chatgpt";
      process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";

      let sawPartialMidRun = false;
      __setTestMemberAsker(async (member, _messages, phase) => {
        // On the first (proposal) call, prove the checkpoint file already exists.
        if (!sawPartialMidRun) {
          const entries = await readdir(dir);
          sawPartialMidRun = entries.some((name) => name.endsWith(".partial.jsonl"));
        }
        await delay(1);
        if (phase === "proposal") return `PROPOSAL from ${member.name}`;
        if (phase === "deliberation") return "CANDIDATE_CONSENSUS:\nShared plan.";
        return "CONSENSUS: ACCEPT";
      });

      const result = await runModelCouncil({ prompt: "resilience: checkpoint lifecycle" });

      expect(sawPartialMidRun).toBe(true);
      expect(result.consensus.outcome).toBe("ratified");
      // Removed on successful completion.
      const remaining = (await readdir(dir)).filter((name) => name.endsWith(".partial.jsonl"));
      expect(remaining).toHaveLength(0);
    });
  });
});

describe("B4 — per-call cost/latency ledger", () => {
  test("one ledger entry per successful call with wallMs > 0, and totals that aggregate", async () => {
    await withTempDeliberationsDir(async () => {
      process.env.AGENTS_COUNCIL_MEMBERS = "claude,chatgpt";
      process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";
      __setTestMemberAsker(cannedAsker());

      const result = await runModelCouncil({ prompt: "resilience: ledger" });

      // propose(2) + deliberate(2) + ratify(2) = 6 successful calls.
      expect(result.ledger).toHaveLength(6);
      for (const entry of result.ledger ?? []) {
        expect(entry.wallMs).toBeGreaterThan(0);
        expect(entry.promptChars).toBeGreaterThan(0);
        expect(entry.responseChars).toBeGreaterThan(0);
      }
      expect(result.ledger?.map((entry) => entry.phase)).toEqual([
        "proposal",
        "proposal",
        "deliberation",
        "deliberation",
        "ratification",
        "ratification",
      ]);

      const totals = result.ledgerTotals!;
      expect(totals.calls).toBe(6);
      expect(totals.wallMs).toBe((result.ledger ?? []).reduce((sum, entry) => sum + entry.wallMs, 0));
      expect(totals.promptChars).toBe((result.ledger ?? []).reduce((sum, entry) => sum + entry.promptChars, 0));
      expect(totals.responseChars).toBe((result.ledger ?? []).reduce((sum, entry) => sum + entry.responseChars, 0));
    });
  });
});

describe("B5 — advisory brief-size precheck", () => {
  test("an over-budget member warns to stderr but is NOT dropped by default", async () => {
    await withTempDeliberationsDir(async () => {
      process.env.AGENTS_COUNCIL_MEMBERS = "claude,chatgpt,gemini";
      process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";
      process.env.AGENTS_COUNCIL_CONTEXT_TOKENS_CLAUDE = "1"; // force claude over budget
      delete process.env.AGENTS_COUNCIL_DROP_OVERSIZED;
      __setTestMemberAsker(cannedAsker());

      const captured: string[] = [];
      const original = process.stderr.write;
      process.stderr.write = ((chunk: string | Uint8Array): boolean => {
        captured.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString());
        return true;
      }) as typeof process.stderr.write;
      let result: ModelCouncilResult;
      try {
        result = await runModelCouncil({ prompt: "resilience: oversized warn only" });
      } finally {
        process.stderr.write = original;
      }

      const warning = captured.join("");
      expect(warning).toMatch(/WARNING: council member Opus 4\.8 \(claude\)/);
      expect(warning).toMatch(/oversized round-0 brief/);
      // Advisory only — no drop, full roster ran.
      expect(result.degraded ?? false).toBe(false);
      expect(result.droppedMembers ?? []).toHaveLength(0);
      expect(result.responses.map((response) => response.member.name)).toContain("Opus 4.8");
    });
  });

  test("with AGENTS_COUNCIL_DROP_OVERSIZED=1 the over-budget member is dropped pre-spend via the B3 machinery", async () => {
    await withTempDeliberationsDir(async () => {
      process.env.AGENTS_COUNCIL_MEMBERS = "claude,chatgpt,gemini";
      process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";
      process.env.AGENTS_COUNCIL_CONTEXT_TOKENS_CLAUDE = "1";
      process.env.AGENTS_COUNCIL_DROP_OVERSIZED = "1";

      const askedMembers = new Set<string>();
      __setTestMemberAsker(async (member, _messages, phase) => {
        askedMembers.add(member.id);
        await delay(1);
        if (phase === "proposal") return `PROPOSAL from ${member.name}`;
        if (phase === "deliberation") return "CANDIDATE_CONSENSUS:\nShared plan.";
        return "CONSENSUS: ACCEPT";
      });

      const result = await runModelCouncil({ prompt: "resilience: oversized drop" });

      expect(result.degraded).toBe(true);
      const claudeDrop = result.droppedMembers?.find((drop) => drop.id === "claude");
      expect(claudeDrop).toBeDefined();
      expect(claudeDrop?.phase).toBe("precheck");
      expect(claudeDrop?.round).toBeNull();
      // Dropped pre-spend: claude was never asked; the 2 survivors carried the run.
      expect(askedMembers.has("claude")).toBe(false);
      expect(result.consensus.outcome).toBe("ratified");
      expect(result.consensus.ratifiedBy).toHaveLength(2);
    });
  });
});

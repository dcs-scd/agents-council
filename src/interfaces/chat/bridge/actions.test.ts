import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { watchCouncilState } from "../../../core/state/watcher";
import {
  closeCouncilAction,
  getCurrentSessionDataAction,
  getSettingsAction,
  getSummonSettingsAction,
  joinCouncilAction,
  listSessionsAction,
  sendResponseAction,
  setActiveSessionAction,
  startCouncilAction,
  summonAgentAction,
  updateSettingsAction,
  updateSummonSettingsAction,
} from "./actions";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(async (directory) => {
      await rm(directory, { recursive: true, force: true });
    }),
  );

  delete process.env.AGENTS_COUNCIL_STATE_PATH;
});

async function withTempStatePath<T>(run: (statePath: string) => Promise<T>): Promise<T> {
  const directory = await mkdtemp(path.join(os.tmpdir(), "agents-council-bridge-"));
  tempDirs.push(directory);
  const statePath = path.join(directory, "state.json");
  process.env.AGENTS_COUNCIL_STATE_PATH = statePath;
  return run(statePath);
}

async function waitFor(predicate: () => boolean, timeoutMs: number): Promise<void> {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > timeoutMs) {
      throw new Error("Timed out waiting for condition.");
    }
    await Bun.sleep(10);
  }
}

describe("chat bridge actions", () => {
  test("supports start/join/get/send/close council flow", async () => {
    await withTempStatePath(async () => {
      const started = await startCouncilAction({
        agent_name: "host",
        request: "Need focused council feedback",
      });
      expect(started.state.session?.status).toBe("active");
      const firstSessionId = started.session_id;

      const joined = await joinCouncilAction({ agent_name: "advisor" });
      expect(joined.session_id).toBe(started.session_id);

      await sendResponseAction({
        agent_name: "advisor",
        content: "Here is the recommended approach.",
      });

      const current = await getCurrentSessionDataAction({ agent_name: "host" });
      expect(current.feedback.length).toBeGreaterThan(0);
      expect(current.feedback.at(-1)?.content).toBe("Here is the recommended approach.");

      const closed = await closeCouncilAction({
        agent_name: "host",
        conclusion: "Consensus reached.",
      });
      expect(closed.state.session?.status).toBe("closed");
      expect(closed.conclusion.content).toBe("Consensus reached.");

      const second = await startCouncilAction({
        agent_name: "host",
        request: "Second matter for the council archive.",
      });
      expect(second.session_id).not.toBe(firstSessionId);

      const sessions = await listSessionsAction({});
      expect(sessions.sessions.length).toBeGreaterThanOrEqual(2);
      expect(sessions.active_session_id).toBe(second.session_id);

      const switched = await setActiveSessionAction({
        agent_name: "advisor",
        session_id: firstSessionId,
      });
      expect(switched.session_id).toBe(firstSessionId);
      expect(switched.state.session?.status).toBe("closed");
    });
  });

  test("emits live-update watcher notifications on state changes", async () => {
    await withTempStatePath(async (statePath) => {
      let changes = 0;
      const watcher = watchCouncilState({
        statePath,
        debounceMs: 10,
        onChange: () => {
          changes += 1;
        },
      });

      try {
        // fs.watch arms asynchronously. This used to be a bare `Bun.sleep(50)` — a guess at
        // how long that takes, which loses under load: the state write lands before the
        // watcher registers, no event ever fires, and the test hangs to its timeout. Prove
        // the watcher is live instead, by touching a sentinel in the watched directory until
        // a change lands (`state.json.arm` matches the watcher's `${targetName}.` prefix rule).
        const sentinel = `${statePath}.arm`;
        const armDeadline = Date.now() + 5000;
        while (changes === 0) {
          if (Date.now() > armDeadline) {
            throw new Error("fs.watch never armed.");
          }
          await Bun.write(sentinel, "arm");
          await Bun.sleep(20);
        }
        await rm(sentinel, { force: true });

        // Let the arming traffic drain past the debounce, then count only what the real
        // actions below cause.
        await Bun.sleep(50);
        changes = 0;

        await startCouncilAction({
          agent_name: "host",
          request: "Observe state watcher updates.",
        });

        await waitFor(() => changes >= 1, 2000);

        // Baseline before the second action: the original re-asserted `changes >= 1`, which
        // the line above had already made true, so it could never fail and the second state
        // change was never actually checked.
        const afterStart = changes;

        await sendResponseAction({
          agent_name: "observer",
          content: "Watcher update confirmation.",
        });

        await waitFor(() => changes > afterStart, 2000);
      } finally {
        watcher.close();
      }
    });
  });

  test("supports summon/settings APIs with actionable validation errors", async () => {
    await withTempStatePath(async () => {
      const initialSettings = await getSettingsAction();
      expect(initialSettings.claude_code_path).toBeNull();
      expect(initialSettings.codex_path).toBeNull();

      const updatedSettings = await updateSettingsAction({
        claude_code_path: "/tmp/claude",
        codex_path: "/tmp/codex",
      });
      expect(updatedSettings.claude_code_path).toBe("/tmp/claude");
      expect(updatedSettings.codex_path).toBe("/tmp/codex");

      const summonSettings = await getSummonSettingsAction();
      expect(summonSettings.supported_agents).toContain("Claude");
      expect(summonSettings.supported_agents).toContain("Codex");
      expect(
        typeof summonSettings.claude_code_version === "string" || summonSettings.claude_code_version === null,
      ).toBe(true);
      expect(typeof summonSettings.codex_cli_version === "string" || summonSettings.codex_cli_version === null).toBe(
        true,
      );

      const summonSettingsAfterUpdate = await updateSummonSettingsAction({
        agent: "Codex",
        model: null,
        reasoning_effort: null,
      });
      expect(summonSettingsAfterUpdate.last_used_agent).toBe("Codex");
      expect(summonSettingsAfterUpdate.agents.Codex?.reasoning_effort).toBeNull();

      await expect(summonAgentAction({ agent: "NotSupportedAgent" })).rejects.toThrow("Unsupported agent.");
    });
  });
});

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

import { fetchTextWithTimeout } from "./modelCouncil";

// WU-A1 / gate_no_bearer (INV-1): the curl shell-out must never carry the
// `Authorization: Bearer <key>` header — or the raw API key — as a spawned
// process argv element, where any `ps` / `/proc/<pid>/cmdline` reader could
// scrape it. The header is instead routed through a 0600 curl `--config` file.
// These tests spy on `Bun.spawn`, capture the exact argv, and assert (a) the
// secret is absent from argv and (b) the auth header still reaches curl via the
// non-argv config-file channel (so requests continue to authenticate).

const FAKE_KEY = "sk-or-v1-SECRET-DO-NOT-LEAK-0123456789";
const STATUS_SENTINEL = "\n__BUN_CURL_HTTP_STATUS__:";

const originalSpawn = Bun.spawn;

type Capture = {
  argv: string[];
  configContents: string[];
};

let captured: Capture;

function installSpawnSpy(): void {
  captured = { argv: [], configContents: [] };
  // @ts-expect-error — overriding the Bun.spawn binding for the test only.
  Bun.spawn = ((cmd: string[], _opts?: unknown) => {
    captured.argv = cmd;
    // Read every --config file's contents NOW, before the implementation
    // unlinks it post-exit, so we can prove the auth header rides the config
    // channel rather than argv.
    for (let i = 0; i < cmd.length; i++) {
      const next = cmd[i + 1];
      if (cmd[i] === "--config" && typeof next === "string") {
        try {
          captured.configContents.push(readFileSync(next, "utf8"));
        } catch {
          captured.configContents.push("<unreadable>");
        }
      }
    }
    // A minimal fake curl process: a 200 response with an empty JSON body and
    // the status trailer the parser expects. No real network/curl involved.
    const stdout = `{}${STATUS_SENTINEL}200`;
    return {
      stdin: { write: () => {}, end: () => {} },
      stdout: new Response(stdout).body,
      stderr: new Response("").body,
      exited: Promise.resolve(0),
    };
  }) as typeof Bun.spawn;
}

beforeEach(() => {
  installSpawnSpy();
});

afterEach(() => {
  Bun.spawn = originalSpawn;
});

describe("WU-A1 curl auth never leaks into spawned argv", () => {
  test("no argv element contains 'Bearer' or the raw API key", async () => {
    await fetchTextWithTimeout(
      "https://example.invalid/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FAKE_KEY}`,
          "Content-Type": "application/json",
          "X-Title": "Agents Council",
        },
        body: JSON.stringify({ model: "m", messages: [] }),
      },
      5_000,
    );

    expect(captured.argv.length).toBeGreaterThan(0);
    expect(captured.argv[0]).toBe("curl");
    for (const element of captured.argv) {
      expect(element).not.toContain("Bearer");
      expect(element).not.toContain(FAKE_KEY);
      // Defense in depth: no header value should appear as argv at all.
      expect(element).not.toContain("Authorization");
    }
  });

  test("the Authorization header still reaches curl via the --config channel", async () => {
    await fetchTextWithTimeout(
      "https://example.invalid/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FAKE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "m", messages: [] }),
      },
      5_000,
    );

    // curl received exactly one --config file...
    const configIdx = captured.argv.indexOf("--config");
    expect(configIdx).toBeGreaterThanOrEqual(0);
    expect(typeof captured.argv[configIdx + 1]).toBe("string");

    // ...and that file carries the auth header in curl config syntax, so the
    // request authenticates exactly as before — just not via argv.
    expect(captured.configContents.length).toBe(1);
    const config = captured.configContents.join("");
    expect(config).toContain(`header = "Authorization: Bearer ${FAKE_KEY}"`);
    expect(config).toContain(`header = "Content-Type: application/json"`);
  });

  test("a body-less request still keeps any auth header out of argv", async () => {
    await fetchTextWithTimeout(
      "https://example.invalid/health",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${FAKE_KEY}` },
      },
      5_000,
    );

    for (const element of captured.argv) {
      expect(element).not.toContain("Bearer");
      expect(element).not.toContain(FAKE_KEY);
    }
    expect(captured.configContents.some((c) => c.includes(`Bearer ${FAKE_KEY}`))).toBe(true);
  });
});

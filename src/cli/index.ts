import path from "node:path";

import { Command } from "commander";

import {
  formatModelCouncilMarkdown,
  runModelCouncil,
  saveModelCouncilFailure,
  saveModelCouncilRun,
} from "../core/services/modelCouncil";
import { startMcpServer } from "../interfaces/mcp/server";
import { launchDesktopApp } from "./desktopLauncher";

type ResponseFormat = "markdown" | "json";

declare const __COUNCIL_VERSION__: string | undefined;

const LEGACY_CHAT_DEFAULT_PORT = "5123";

const main = async (): Promise<void> => {
  const version = await resolveVersion();
  const program = new Command();

  program.name("council").description("Agents Council MCP").version(version, "-v, --version", "Show version");

  program
    .command("mcp")
    .description("Start the MCP server.")
    .option("-f, --format <markdown|json>", "Response format (default: markdown)", "markdown")
    .option("-n, --agent-name <name>", "Default agent name for the session")
    .action(async (options: { format: string; agentName?: string }) => {
      try {
        const format = parseFormat(options.format);
        const agentName = parseAgentName(options.agentName);
        await startMcpServer({ format, agentName });
      } catch (error) {
        reportAndExit("Failed to start MCP server", error);
      }
    });

  program
    .command("chat")
    .description("Open/focus the desktop Council interface (compatibility alias).")
    .option("-p, --port <number>", "Deprecated: ignored in desktop mode.", LEGACY_CHAT_DEFAULT_PORT)
    .option("--no-open", "Deprecated: ignored in desktop mode.")
    .action(async (options: { port: string; open: boolean }) => {
      try {
        warnLegacyChatOptions(options);
        await launchDesktopApp({ source: "chat" });
      } catch (error) {
        reportAndExit("Failed to launch desktop interface", error);
      }
    });

  program
    .command("solve")
    .description("Run the configured multi-agent model council and print the peer-ratified consensus result.")
    .argument("<prompt...>", "Problem or question for the council")
    .option("--json", "Print the full structured council result as JSON.")
    .action(async (promptParts: string[], options: { json?: boolean }) => {
      try {
        const result = await runModelCouncil({ prompt: promptParts.join(" ") });
        try {
          const saved = await saveModelCouncilRun(result);
          console.error(`Saved deliberation record to ${saved.jsonPath}`);
          console.error(`Saved Markdown answer to ${saved.markdownPath}`);
        } catch (saveError) {
          const detail = saveError instanceof Error ? saveError.message : String(saveError);
          console.error(`Warning: failed to save deliberation record: ${detail}`);
        }
        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(formatModelCouncilMarkdown(result));
        }
        // A blocked council is a hard stop (an absolute veto or an unresolved
        // claim-ledger precondition), so the run must signal failure to its caller
        // (WU-B4). Ratified / not_attempted are non-error completions (exit 0).
        if (result.consensus.outcome === "blocked") {
          process.exitCode = 1;
        }
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        try {
          const saved = await saveModelCouncilFailure({ prompt: promptParts.join(" "), error: detail });
          console.error(`Saved failure transcript to ${saved.jsonPath}`);
        } catch (saveError) {
          const saveDetail = saveError instanceof Error ? saveError.message : String(saveError);
          console.error(`Warning: failed to save failure transcript: ${saveDetail}`);
        }
        reportAndExit("Failed to run model council", error);
      }
    });

  program
    .command("selftest")
    .description("Run an internal schema self-test (proves Zod is bundled).")
    .action(async () => {
      // Dynamic import keeps the structured schema module off the default code
      // paths (INV-2) while still exercising a real Zod parse from the compiled
      // binary — the gate_zod_bundled evidence.
      const { schemaSelfTest } = await import("../core/services/council/schemas");
      const summary = schemaSelfTest();
      console.log(summary);
      if (!summary.startsWith("SELFTEST PASS")) {
        process.exit(1);
      }
    });

  program.on("command:*", (operands: string[]) => {
    const command = operands[0] ?? "unknown";
    console.error(`Unknown command: ${command}`);
    program.outputHelp();
    process.exit(1);
  });

  if (process.argv.length <= 2) {
    try {
      await launchDesktopApp({ source: "default" });
    } catch (error) {
      reportAndExit("Failed to launch desktop interface", error);
    }
    return;
  }

  await program.parseAsync(process.argv);
};

main().catch((error) => {
  reportAndExit("Failed to start council", error);
});

function parseFormat(value: string): ResponseFormat {
  if (value !== "markdown" && value !== "json") {
    throw new Error("Startup error: --format expects 'markdown' or 'json'.");
  }

  return value;
}

function parseAgentName(value?: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const agentName = value.trim();
  if (!agentName) {
    throw new Error("Startup error: --agent-name expects a value.");
  }

  return agentName;
}

function warnLegacyChatOptions(options: { port: string; open: boolean }): void {
  if (options.port !== LEGACY_CHAT_DEFAULT_PORT) {
    console.warn("Ignoring legacy --port/-p option. `council chat` now launches desktop mode.");
  }
  if (!options.open) {
    console.warn("Ignoring legacy --no-open option. `council chat` now launches desktop mode.");
  }
}

function reportAndExit(message: string, error: unknown): never {
  const details = error instanceof Error ? error.message : String(error);
  console.error(`${message}: ${details}`);
  process.exit(1);
}

async function resolveVersion(): Promise<string> {
  if (typeof __COUNCIL_VERSION__ === "string" && __COUNCIL_VERSION__.length > 0) {
    return __COUNCIL_VERSION__;
  }
  if (typeof process.env.npm_package_version === "string" && process.env.npm_package_version.length > 0) {
    return process.env.npm_package_version;
  }

  const candidates: string[] = [];
  const binaryPath = process.argv[0];
  if (binaryPath) {
    const binaryDir = path.dirname(path.resolve(binaryPath));
    candidates.push(path.join(binaryDir, "package.json"));
    candidates.push(path.join(binaryDir, "..", "package.json"));
  }
  const scriptPath = process.argv[1];
  if (scriptPath) {
    const scriptDir = path.dirname(path.resolve(scriptPath));
    candidates.push(path.join(scriptDir, "..", "package.json"));
    candidates.push(path.join(scriptDir, "..", "..", "package.json"));
  }

  for (const candidate of candidates) {
    try {
      const data = await Bun.file(candidate).json();
      if (data && typeof data.version === "string" && data.version.length > 0) {
        return data.version;
      }
    } catch {
      // Ignore missing or unreadable package.json.
    }
  }

  return "0.0.0";
}

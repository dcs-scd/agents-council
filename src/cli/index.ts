import path from "node:path";

import { Command } from "commander";

import {
  buildDefaultMembers,
  councilOutcomeExitCode,
  formatModelCouncilMarkdown,
  resolveMaxRounds,
  runModelCouncil,
  saveModelCouncilFailure,
  saveModelCouncilRun,
} from "../core/services/modelCouncil";
import { resolveDeliberationsDir } from "../core/state/path";
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
    .argument("[prompt...]", "Problem or question for the council (omit when using --file).")
    .option("--file <path>", "Read the prompt from a file instead of the argv prompt (mutually exclusive).")
    .option("--members <a,b,c>", "Comma-separated council roster for this run; overrides AGENTS_COUNCIL_MEMBERS.")
    .option("--json", "Print the full structured council result as JSON.")
    .action(async (promptParts: string[], options: { file?: string; members?: string; json?: boolean }) => {
      let prompt: string;
      try {
        prompt = await resolveSolvePrompt(promptParts, options.file);
      } catch (error) {
        reportAndExit("Failed to run model council", error);
      }

      // An explicit --members roster wins over the ambient AGENTS_COUNCIL_MEMBERS
      // by overwriting it, so the run and the engine's own roster validation see a
      // single source of truth (an unmatched roster throws exactly as the env path).
      if (typeof options.members === "string" && options.members.trim().length > 0) {
        process.env.AGENTS_COUNCIL_MEMBERS = options.members;
      }

      try {
        printSolveBanner(version);
        const result = await runModelCouncil({ prompt });
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
        // A blocked council is a hard stop — an absolute veto cast BY A MEMBER — so the
        // run must signal failure to its caller (WU-B4). Claim-ledger preconditions are
        // hygiene findings and never force a non-zero exit. Ratified / ratified_with_edits
        // / not_attempted are non-error completions (exit 0).
        // The outcome -> exit-code map is the unit-tested councilOutcomeExitCode.
        process.exitCode = councilOutcomeExitCode(result.consensus.outcome);
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        try {
          const saved = await saveModelCouncilFailure({ prompt, error: detail });
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

// Resolve the council prompt from either the argv prompt or --file, enforcing
// that exactly one source is given. Reading from a file kills the ~128KB argv
// limit that forced run-council4's deep-import driver.
async function resolveSolvePrompt(promptParts: string[], file: string | undefined): Promise<string> {
  const argvPrompt = promptParts.join(" ").trim();
  const hasArgv = argvPrompt.length > 0;
  const filePath = typeof file === "string" ? file.trim() : "";
  const hasFile = filePath.length > 0;

  if (hasArgv && hasFile) {
    throw new Error("Provide either a prompt argument or --file, not both.");
  }
  if (!hasArgv && !hasFile) {
    throw new Error("Provide a prompt: pass it as an argument or with --file <path>.");
  }

  if (hasFile) {
    try {
      return await Bun.file(filePath).text();
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`--file could not be read (${filePath}): ${detail}`);
    }
  }

  return argvPrompt;
}

// One stderr line on start: the resolved roster, engine version, max rounds, and
// the deliberations dir actually resolved (env-pinned or project-local default),
// so backgrounded runs record where their transcripts will land.
function printSolveBanner(version: string): void {
  const roster = buildDefaultMembers()
    .map((member) => member.id)
    .join(",");
  console.error(
    `council solve: roster=${roster} version=${version} maxRounds=${resolveMaxRounds()} deliberations=${resolveDeliberationsDir()}`,
  );
}

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

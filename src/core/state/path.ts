import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Anchored to this source file (src/core/state/path.ts) so the location is
// stable regardless of the invocation cwd. Three levels up reaches the project
// root, which is where the deliberations/ transcript folder lives.
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

export function resolveCouncilStatePath(statePath?: string): string {
  const trimmed = statePath?.trim();
  if (trimmed) {
    return normalizePath(trimmed);
  }

  const override = process.env.AGENTS_COUNCIL_STATE_PATH?.trim();
  if (override) {
    return normalizePath(override);
  }

  return path.join(homedir(), ".agents-council", "state.json");
}

// Where council deliberation transcripts are written. Defaults to the
// project-local deliberations/ folder; override with AGENTS_COUNCIL_DELIBERATIONS_DIR.
export function resolveDeliberationsDir(): string {
  const override = process.env.AGENTS_COUNCIL_DELIBERATIONS_DIR?.trim();
  if (override) {
    return normalizePath(override);
  }

  return path.join(PROJECT_ROOT, "deliberations");
}

export function normalizePath(input: string): string {
  if (input === "~") {
    return homedir();
  }

  if (input.startsWith("~/")) {
    return path.join(homedir(), input.slice(2));
  }

  return path.resolve(input);
}

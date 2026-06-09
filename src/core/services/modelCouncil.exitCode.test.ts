import { describe, expect, test } from "bun:test";

import { type ModelCouncilConsensusOutcome, councilOutcomeExitCode } from "./modelCouncil";

// Pins the WU-B4 caller contract surfaced by `council solve` (src/cli/index.ts):
// a `blocked` council — an absolute veto or an unresolved claim-ledger
// precondition — MUST exit non-zero so a calling script sees the hard stop,
// while `ratified` and `not_attempted` are non-error completions (exit 0). The
// CLI exit branch is otherwise unreachable in a unit test (main() auto-runs on
// import and `solve` drives the live council), so this guards the veto -> exit-1
// signal against a silent regression that would flip it.
describe("councilOutcomeExitCode", () => {
  test("blocked exits non-zero (1)", () => {
    expect(councilOutcomeExitCode("blocked")).toBe(1);
  });

  test("ratified exits 0", () => {
    expect(councilOutcomeExitCode("ratified")).toBe(0);
  });

  test("not_attempted exits 0", () => {
    expect(councilOutcomeExitCode("not_attempted")).toBe(0);
  });

  test("every frozen outcome maps to a conventional exit code (0 or 1)", () => {
    const outcomes: ModelCouncilConsensusOutcome[] = ["ratified", "blocked", "not_attempted"];
    for (const outcome of outcomes) {
      expect([0, 1]).toContain(councilOutcomeExitCode(outcome));
    }
  });
});

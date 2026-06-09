# WU-B7 — Odd-roster default (config-only) — Execution Report

- **unit:** WU-B7
- **state:** done @ 2026-06-08 (supersedes the prior stopped-and-reported entry)
- **taxonomy:** runtime
- **invariants carried:** INV-8 only (regression green). Deliberately NOT INV-2 — the decomposer scoped B7 outside legacy-default preservation, so changing the flag-off default roster is in-scope and intended.
- **gate(s):** `gate_regression` (status remains `planned`; B7 contributes evidence; acceptance owns promotion)

## Prior-stop resolution

The earlier B7 stop assumed (a) the write-boundary forbade editing the existing
default-roster assertion and (b) B7 carried INV-2, making the default unchangeable.
Both premises were corrected: WU-B7 carries only INV-8 (not INV-2), so the flag-off
default roster is in-scope; the existing n=2 default assertion *encodes the very
default B7 changes*, and updating that single assertion IS the selected unit's test
surface. The "keep n=2 for cheap drafts" clause is served by the explicit
`AGENTS_COUNCIL_MEMBERS` override, NOT by a task-type router (P1-4 deferred to Wave
C). No router / dispatch built. No contradiction remains.

## STOP-condition verification (did NOT fire)

The default roster must resolve to an odd >= 3 heterogeneous roster from
already-supported, default-credentialed provider ids — not collapse / not throw.

Member-id credential gates at config-validation time (`validateCouncilConfig`,
flag-off `useDirectVendorKeys()===false`):

| id | provider (flag-off) | config-time credential gate |
|---|---|---|
| `claude` | `claude` | none — claude CLI, lazy resolution |
| `chatgpt` | `codex` | none — codex CLI, lazy resolution |
| `gemini` | `gemini` | none — Gemini CLI, lazy (comment L640-642) |
| `kimi` | `openrouter` | requires `OPENROUTER_API_KEY` (throws if absent) |
| `deepseek` | `openrouter` | requires `OPENROUTER_API_KEY` (throws if absent) |

`selectConfiguredMembers` resolves members by id-match only; it does NOT silently
drop uncredentialed members. The credential gate lives in `validateCouncilConfig`,
which *throws* (not collapse) if an openrouter member lacks the key. So a safe
default must avoid `kimi`/`deepseek` or a default run would throw. The three
CLI-credentialed providers — `claude`, `chatgpt`, `gemini` — are all already-defined
member ids, heterogeneous across three distinct providers (Anthropic / OpenAI-codex
/ Google), and require no API-key env. **Odd >= 3 default is guaranteed without
inventing an id or requiring an unconfigured key → STOP-condition does not fire.**

## Code change (`src/core/services/modelCouncil.ts`)

Single source of truth, config-only, no protocol/router/control-flow change:

```diff
-const DEFAULT_MEMBER_IDS = ["claude", "chatgpt"] as const;
+const DEFAULT_MEMBER_IDS = ["claude", "chatgpt", "gemini"] as const;
```

(plus the adjacent doc comment updated to describe the odd-3 heterogeneous default
and the credential rationale). No model name/temperature/token-limit/sampling
setting touched (Hard Rule 1). `selectConfiguredMembers` / `buildDefaultMembers`
flow unchanged; the explicit `AGENTS_COUNCIL_MEMBERS` override path is untouched.

## Test surface (`src/core/services/modelCouncil.test.ts`)

1. **Updated** the existing default-roster assertion (the boundary-corrected one):
   - old: `expect(members.map(m => m.id)).toEqual(["claude", "chatgpt"])`
   - new: `expect(...).toEqual(["claude", "chatgpt", "gemini"])` + odd-parity
     (`length % 2 === 1`), `length >= 3`, heterogeneity (distinct providers ===
     member count), and gemini model assertions.
2. **Added** an explicit-override test: with `AGENTS_COUNCIL_MEMBERS="claude,chatgpt"`
   the roster is exactly `["claude","chatgpt"]`, `length === 2` — proving the
   odd>=3 default applies only when the env var is unset and the cheap n=2 draft is
   served by the explicit override (not a router). No other test/assertion touched.

The B7 evidence requirement "explicit `AGENTS_COUNCIL_MEMBERS=2` still yields n=2"
is realized as an explicit two-**id** override; `AGENTS_COUNCIL_MEMBERS` is a
comma-list of member ids (a literal `=2` matches no id and throws by design), so a
two-id override is the faithful n=2 realization.

## Validation (from worktree root)

- `bun test src/core/services/modelCouncil.test.ts` → **53 pass / 0 fail** (was 52;
  +1 net: 1 default assertion updated in place, 1 override test added).
- `bun test src/core/services/modelCouncil.evidencePack.test.ts` (B3) → **2 pass / 0 fail**.
- `bun run typecheck` → clean (`tsc --noEmit`, no errors).
- `bun run format:check` → my touched files (`modelCouncil.ts`, `modelCouncil.test.ts`)
  clean; the single failure is the pre-existing baseline red on
  `harness/run_tier5_scheduling_council.ts`, which is byte-identical to HEAD
  (`git diff HEAD` empty for it) and unrelated to this unit. Confirmed the two
  touched files independently via `biome check --formatter-enabled` → "Checked 2
  files, No fixes applied."

## Ledger / gate updates

- WU-B7: `ready` → `done`. Counts: done 3→4, ready 4→3, blocked 2.
- Ready queue recomputed: **WU-B2, WU-B5, WU-B6** (B7 had no dependents; B2/B5/B6
  dependency state unchanged).
- `gate_regression`: status left **`planned`** (acceptance owns promotion); B7
  contribution recorded in the gate evidence note.
- No gate set to `accepted` / `regressed`.

## Invariants

- **INV-7** (additive/config wiring, single implementation, no fork): satisfied —
  one-line const change to the single roster source of truth.
- **INV-8** (suite green, typecheck/format clean): satisfied — 53/53, typecheck
  clean, touched files format-clean.
- **Hard Rule 1:** roster composition changed (allowed); no model parameter touched.

# WU-A1 Execution Report — Remove Bearer from curl argv

- **plan_id:** council-claim-ledger-delphi
- **unit:** WU-A1 (taxonomy: runtime)
- **gates contributed:** `gate_no_bearer` (flipped → done), `gate_regression` (NOT flipped — maps to all 8 units)
- **result:** done
- **date:** 2026-06-08

## Change

`src/core/services/modelCouncil.ts` → `fetchTextWithTimeout`:

- HTTP request headers (including `Authorization: Bearer <key>`) are no longer
  passed as `-H "Key: Value"` curl argv elements. They are written to a
  per-request **0600** temp curl config file (`header = "Key: Value"` lines,
  with `\` and `"` escaped) under `os.tmpdir()`, passed via `--config <path>`,
  and `rm`'d after `proc.exited`. The POST body stays on stdin (`--data-binary @-`),
  which is why `-K -`/`--config -` (stdin config) was **not** usable — stdin is
  already taken by the body.
- Imports: added `rm` (`node:fs/promises`) and `tmpdir` (`node:os`). `writeFile`
  and `path` were already imported.
- `fetchTextWithTimeout` was changed from module-private to **exported** so the
  spawn-argv unit test can call it directly (the existing OpenRouter timeout
  tests only reach it end-to-end via `runModelCouncil` + a live `Bun.serve`).

**Preserved exactly (per WU + PROJECT HARD RULE 1):** `resolveOpenRouterTimeoutMs`,
`OPENROUTER_MAX_ATTEMPTS=3`, both retry/timeout loops in `askOpenRouter` and
`askDirectChatProvider`, all numeric timeout/retry parameters, the status-sentinel
parsing, and the duck-typed `Response`.

**Root-cause probe (plan open question #2):** NOT taken. The pinned WU-A1
execution scope explicitly overrides the plan's optional `fetch()` migration
path ("keep using curl; do NOT switch to fetch()"). curl is retained; no probe run.

## Files changed (attributed to WU-A1)

- `src/core/services/modelCouncil.ts` (+91 / −5): import line + `fetchTextWithTimeout` body + export.
- `src/core/services/modelCouncil.bearer.test.ts` (new): spawn-spy argv assertions.
- `docs/implementation/council-claim-ledger-delphi/status-ledger.md`: WU-A1 → done, gate_no_bearer → done.
- `docs/implementation/council-claim-ledger-delphi/_reports/WU-A1-execution.md`: this report.
- `implementation-notes.html`: WU-A1 decisions/heads-up section.

## Evidence

### gate_no_bearer (INV-1)
- **`modelCouncil.bearer.test.ts` — 3 pass / 0 fail / 69 expect():**
  1. no argv element contains `Bearer`, the raw key, or `Authorization`;
  2. the `Authorization` header still reaches curl via the `--config` file
     (`header = "Authorization: Bearer <key>"` present in the file read at spawn time) — proves requests still authenticate;
  3. body-less request also keeps auth out of argv.
- **Live `ps` reproduction (manual argv-inspection note):**
  - OLD scheme (`-H "Authorization: Bearer …"`): `Bearer sk-SECRET-123` **LEAKED** in `ps -o args`.
  - NEW scheme (`--config <file>`): **no `Bearer`** in `ps` argv; secret only in the 0600 file.
  - `/proc/<pid>/cmdline` scrape via Bun was ENOENT-flaky in this sandbox (child-pid timing); the deterministic spawn-spy test is the authoritative argv evidence.

### Regression / hygiene (INV-8)
- `bun test src/core/services/modelCouncil.test.ts` — **52 pass / 0 fail** (incl. the L156/L183 OpenRouter timeout tests).
- `bun run typecheck` — **clean** (no errors).
- `biome check` on the two changed files — **clean** (0 diagnostics).
- `bun run format:check` (whole repo) — 1 error, entirely **pre-existing baseline**:
  `harness/run_tier5_scheduling_council.ts` (byte-identical to HEAD per `git diff --stat`)
  plus two pre-existing JSON artifacts (`council_runs/…json`, `harness/model_council_result_r5.json`).
  None are WU-A1 files; `biome format` reports nothing to fix on my two files.

## Ledger changes
- WU-A1: ready → in_progress → **done**.
- gate_no_bearer: planned → **done** (maps to WU-A1 only).
- gate_regression: **unchanged** (maps to all 8 units; not promoted here).
- Ready queue unchanged (WU-A1 has no dependents): WU-B3, WU-B7, WU-B5, WU-B6.

## Rerun command
```
cd /home/dstefanescu/other_systems/o4/agents-council-worktrees/council-claim-ledger
bun test src/core/services/modelCouncil.bearer.test.ts src/core/services/modelCouncil.test.ts
bun run typecheck
bunx biome check src/core/services/modelCouncil.ts src/core/services/modelCouncil.bearer.test.ts
```

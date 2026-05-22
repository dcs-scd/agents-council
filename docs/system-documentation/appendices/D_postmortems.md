# Appendix D: Post-Mortem Archive

> **Last Updated:** 2026-05-22
> **Related:** [1.4 System History](../part1_understanding/1.4_system_history.md) · [2.4 ADRs](../part2_architecture/2.4_adrs.md) · [Appendix E: Tech Debt](E_tech_debt.md)

---

`agents-council` is a young experimental project with no production-incident history. In place of operational post-mortems, this appendix records **engineering retrospectives** reconstructed from the backlog/task history (`backlog/tasks/`, `backlog/milestones/`) — the notable problems encountered during development and how they were resolved. They are documented in post-mortem form because the lessons generalize.

## PM-01 — Windows CI smoke-test PowerShell quoting

**Source:** `task-9 — Fix Windows smoke test PowerShell quoting in CI`

**What happened.** The cross-platform CLI smoke test (`council --version` / `--help`) failed on the Windows runner due to PowerShell's different quoting/escaping rules versus bash.

**Impact.** CI red on Windows; the build-smoke job could not validate the Windows binary.

**Root cause.** A single shell-syntax assumption (bash-style quoting) applied to all matrix platforms, where Windows uses `pwsh`.

**Resolution.** Branch the build/smoke steps by platform — `shell: bash` for Unix, `shell: pwsh` for Windows — with platform-appropriate quoting and `.exe` handling (visible today in `ci.yml`/`release.yml`).

**Lesson.** Matrix CI must treat shell syntax per-platform; never assume one quoting style across runners.

## PM-02 — Lint/typecheck drift, then enforcement

**Source:** `task-11 — Resolve lint/typecheck errors and enforce typecheck pre-commit`

**What happened.** Lint and typecheck errors had accumulated; quality gates were not enforced, so regressions could land.

**Impact.** Inconsistent code quality; risk of broken types reaching `main`.

**Root cause.** No automated gate between "developer commits" and "CI runs."

**Resolution.** Resolve the backlog of errors, then enforce the gate two ways: Husky `pre-commit` running `lint-staged` (Biome on staged files) locally, and the `lint-and-typecheck` job on all three OSes in CI.

**Lesson.** Fix the backlog *and* install the ratchet; an un-enforced standard regresses.

## PM-03 — Runtime version resolution fragility

**Source:** `task-13 — Embed version at compile time for CLI version output`

**What happened.** `council --version` could not reliably determine its version once compiled to a standalone binary (no adjacent `package.json` in some install layouts).

**Impact.** Wrong or missing version output, complicating support and reproducibility.

**Root cause.** Relying solely on reading a nearby `package.json` at runtime, which isn't guaranteed for a compiled binary.

**Resolution.** Embed the version at build time via the `__COUNCIL_VERSION__` define (set from the git tag in the release pipeline), with a layered runtime fallback: define → `npm_package_version` → nearby `package.json` → `0.0.0`.

**Lesson.** For compiled artifacts, bake in build metadata; treat runtime file lookups as fallback only.

## PM-04 — The Electrobun pivot and its documentation debt

**Source:** Milestone 4 (`m-4`), `task-26.x`, and `task-26.8 — Documentation migration for Electrobun pivot and MCP v2 session contract`

**What happened.** Moving the UI from a browser-on-HTTP-server model to an Electrobun desktop app, *and* moving state from single-session (v1) to multi-session (v2), invalidated swathes of existing documentation and the implicit "current session" contract.

**Impact.** A large coordinated change touching the runtime entry point, the MCP tool contract (every tool gained `session_id`), packaging, and docs.

**Root cause.** The original single-session, HTTP-first design didn't anticipate a desktop-first, multi-session product.

**Resolution.** Sequence the pivot as sub-tasks (compatibility baseline → app scaffold → multi-session core → session-targeted MCP → desktop bridge → canonical UI → CI/packaging) and migrate documentation alongside (`task-26.8`). A release-sequencing gate was added: no public tag until the canonical desktop UI integration is merged and validated.

**Lesson.** Large pivots need explicit sub-task sequencing, a state-migration path that keeps old files readable ([3.5](../part3_data/3.5_migrations.md)), and synchronized documentation; gate the release on the riskiest integration.

## PM-05 — Summon binary resolution across install layouts

**Source:** `summon.ts` design (Summon Claude/Codex milestones m-2/m-3)

**What happened.** The Agent SDK validates a "native binary" when given a bare command name but accepts an npm-installed `claude` when given an absolute path; bare-name resolution failed in some setups.

**Impact.** Summon could fail to locate the agent CLI.

**Root cause.** SDK path-validation semantics differ for bare commands vs absolute paths.

**Resolution.** `resolveExecutablePath` resolves bare commands to absolute paths via `which`/`where` (first line on Windows), with a layered precedence (config → env → PATH/bundled). Codex falls back to a `config.toml` default model when discovery is unavailable.

**Lesson.** When shelling out to user-installed tools, resolve to absolute paths and provide layered overrides; don't assume PATH semantics match an SDK's expectations.

## Cross-Cutting Themes

| Theme | Episodes | Takeaway |
|-------|----------|----------|
| Cross-platform correctness | PM-01, PM-05 | Per-platform shell + path handling is mandatory |
| Quality ratchets | PM-02 | Enforce gates, don't just fix the backlog |
| Build-time vs runtime metadata | PM-03 | Bake in what a compiled binary can't reliably read |
| Large pivots | PM-04 | Sequence sub-tasks, migrate state + docs together, gate the release |

> These entries are reconstructed from the development backlog, not from production incidents. As the project matures, genuine operational post-mortems should be appended here in the same format (What happened / Impact / Root cause / Resolution / Lesson).

---

*Next: [Appendix E: Technical Debt Registry →](E_tech_debt.md)*

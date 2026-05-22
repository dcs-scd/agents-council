# Appendix E: Technical Debt Registry

> **Last Updated:** 2026-05-22
> **Related:** [2.4 ADRs](../part2_architecture/2.4_adrs.md) · [1.4 System History](../part1_understanding/1.4_system_history.md) · [Appendix D: Post-Mortems](D_postmortems.md)

---

Known debt items observed in the v0.4.0 codebase, with impact and a suggested remediation. These are honest observations to guide future work, not blockers — the project is explicitly experimental.

## TD-01 — Hardcoded `0.1.0` version strings

**Severity:** Low

**Where.** `interfaces/mcp/server.ts` constructs the `McpServer` with `version: "0.1.0"`; `core/services/council/summon.ts` uses `version: "0.1.0"` for both `createSdkMcpServer` and the Codex `app-server` `initialize` `clientInfo`. Meanwhile `package.json` and `electrobun.config.ts` are at `0.4.0`.

**Impact.** The MCP server and summon clients advertise a stale version that doesn't track releases — confusing for clients that log/inspect server version.

**Remediation.** Source these from the same `__COUNCIL_VERSION__`/package version used by the CLI ([PM-03](D_postmortems.md)), so all version surfaces move together.

## TD-02 — Two parallel UI transports

**Severity:** Medium

**Where.** `interfaces/chat/server.ts` (the `Bun.serve` HTTP face + WebSocket) remains fully implemented and shares the bridge `actions`, but after the Electrobun pivot the CLI `chat` command launches the desktop instead of the HTTP server. Nothing in the CLI starts the HTTP server.

**Impact.** Dead-ish code path; a maintainer can mistake the HTTP server for the live UI transport. Two notification mechanisms (`ws.publish` vs `rpc.stateChanged`) to keep in sync.

**Remediation.** Either (a) formally document the HTTP server as a supported alternate face and add a CLI flag to start it, or (b) remove it if the desktop is the only intended UI. Decide and converge.

## TD-03 — CI does not run the unit suite

**Severity:** Medium

**Where.** `ci.yml` runs lint, typecheck, and Electrobun build-smoke, but not `bun test`.

**Impact.** The domain/persistence/mapper/action/consensus tests are only run locally (and via the pre-commit gate on staged files), so a change that breaks a test but passes lint/typecheck could merge.

**Remediation.** Add a `bun test` step to the `lint-and-typecheck` job (or a dedicated job) on at least one OS.

## TD-04 — Unbounded state growth, no pruning

**Severity:** Low–Medium (scales with use)

**Where.** `state.json` accumulates sessions/requests/feedback indefinitely; `load()` reads and normalizes the whole file each time.

**Impact.** Very long-lived installs with large histories pay growing read/normalize cost on every access, including every poll.

**Remediation.** Add an optional archival/prune command (e.g. drop or externalize sessions older than N), or lazily exclude closed sessions from hot-path reads.

## TD-05 — Bridge vs MCP session-targeting asymmetry

**Severity:** Low

**Where.** The MCP face is fully session-targeted (`getSessionData(session_id)`), but some bridge actions operate on the **active** session (`getCurrentSessionDataAction` → `getCurrentSessionData`, `sendResponseAction` → `sendResponse`, `closeCouncilAction` → `closeCouncil`). The UI compensates by `setActiveSession` before acting.

**Impact.** Two slightly different ergonomic contracts for the same operations; a future multi-session-in-one-UI feature (roadmap v0.6) will need the bridge to take explicit `session_id` like MCP does.

**Remediation.** Thread `session_id` through the bridge actions to match the MCP contract ahead of the parallel-sessions UI work.

## TD-06 — Summon debug log location is CWD-relative

**Severity:** Low

**Where.** `appendSummonLog` writes to `path.resolve(process.cwd(), "summon-debug.log")`.

**Impact.** The log lands wherever the process happens to run, which can be surprising (and could scatter logs across directories). It may also capture sensitive prompt content.

**Remediation.** Write under `~/.agents-council/` (next to state/config) and document its sensitivity; consider rotation.

## TD-07 — `run_model_council` is not a council participant

**Severity:** Low (design choice / potential feature)

**Where.** `run_model_council` is a standalone tool returning a result; unlike `summon_agent`, it does not post its consensus as feedback into the active council session.

**Impact.** A user mixing both features must manually relay the model-council consensus into a session.

**Remediation.** Optionally add a mode that records the consensus as feedback (or a conclusion) in the active session, unifying it with the summon flow.

## TD-08 — No automated cost guard on the Model Council

**Severity:** Low–Medium (cost)

**Where.** `runModelCouncil` issues up to ~18 model calls with no estimate, confirmation, or rate guard.

**Impact.** Repeated/automated invocation can accrue real cost silently.

**Remediation.** Add an optional pre-run estimate/confirmation and/or a simple invocation-rate cap, surfaced in the CLI/MCP description.

## Debt Summary

| ID | Item | Severity | Theme |
|----|------|----------|-------|
| TD-01 | Hardcoded `0.1.0` versions | Low | Versioning |
| TD-02 | Two UI transports | Medium | Architecture clarity |
| TD-03 | CI omits `bun test` | Medium | Quality gates |
| TD-04 | Unbounded state growth | Low–Med | Scalability |
| TD-05 | Bridge/MCP session asymmetry | Low | API consistency |
| TD-06 | CWD-relative debug log | Low | Operability |
| TD-07 | Model Council not a participant | Low | Feature unification |
| TD-08 | No Model Council cost guard | Low–Med | Cost safety |

> None of these block use of the system today. They are flagged so that the parallel-sessions UI (v0.6), external-LLM summoning (v0.7), and general hardening land on a clean base.

---

*End of Appendices. Return to the [Documentation Index →](../README.md).*

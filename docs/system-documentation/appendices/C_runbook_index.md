# Appendix C: Runbook Index

> **Last Updated:** 2026-05-22
> **Related:** [7.4 Runbooks](../part7_operations/7.4_runbooks.md) · [7.5 Disaster Recovery](../part7_operations/7.5_disaster_recovery.md) · [9.2 Error Codes](../part9_reference/9.2_error_codes.md)

---

Quick-reference index of every operational procedure. Full steps are in [7.4 Runbooks](../part7_operations/7.4_runbooks.md) and [7.5 Disaster Recovery](../part7_operations/7.5_disaster_recovery.md).

## Setup & Usage

| ID | Title | Summary |
|----|-------|---------|
| RB-01 | Register with an MCP client | `claude/gemini/codex/amp mcp add council npx agents-council@latest mcp` |
| RB-02 | Run a council headless | start → join → send → poll(cursor) → close |
| RB-03 | Open the desktop Hall | `council` or `council chat`; name set at the Gate |
| RB-04 | Summon an agent | UI "Summon" or `summon_agent({agent})`; needs `claude`/`codex` auth |
| RB-05 | Run the Model Council | `export OPENROUTER_API_KEY` + `codex login` + `council solve "..."` |
| RB-10 | Refresh summon model lists | Settings → refresh; updates `summonModelsCache` |
| RB-11 | Move the state file | set `AGENTS_COUNCIL_STATE_PATH`; copy files for existing data |
| RB-12 | Upgrade / pin / rollback | `npm i -g agents-council@latest` / `@<version>` |

## Inspection

| ID | Title | Summary |
|----|-------|---------|
| RB-06 | Inspect / audit state | `jq` over `~/.agents-council/state.json` |

## Incident Response

| ID | Title | Trigger | Summary |
|----|-------|---------|---------|
| RB-07 | Stuck file lock | "Timed out waiting for file lock" | wait 30 s stale-reclaim or `rm *.lock` |
| RB-08 | Desktop won't launch | "Desktop runtime is not configured…" | `bun run desktop:dev` to debug; `COUNCIL_DESKTOP_COMMAND` override; reinstall |
| RB-09 | Corrupt state file | "invalid JSON" / "unsupported schema" | back up, restore/fix/remove, validate with `jq` |

## Disaster Recovery Scenarios

| ID | Scenario | Reference |
|----|----------|-----------|
| DR-1 | Corrupt `state.json` | [7.5 §Scenario 1](../part7_operations/7.5_disaster_recovery.md) |
| DR-2 | Unsupported schema | [7.5 §Scenario 2](../part7_operations/7.5_disaster_recovery.md) |
| DR-3 | Integrity violation after edit | [7.5 §Scenario 3](../part7_operations/7.5_disaster_recovery.md) |
| DR-4 | Lost `config.json` | [7.5 §Scenario 4](../part7_operations/7.5_disaster_recovery.md) — self-rebuilds |
| DR-5 | Stuck lock after crash | [7.5 §Scenario 5](../part7_operations/7.5_disaster_recovery.md) |
| DR-6 | Lost binary / broken install | [7.5 §Scenario 6](../part7_operations/7.5_disaster_recovery.md) — data is independent |

## Health Checks (copy/paste)

```bash
council --version                       # CLI installed
council --help                          # usage
jq . ~/.agents-council/state.json       # state readable
claude --version ; codex --version      # summon prerequisites
```

## Emergency Commands

```bash
# Remove a stale lock (no writer running)
rm -f ~/.agents-council/state.json.lock ~/.agents-council/config.json.lock

# Back up state before any risky operation
cp ~/.agents-council/state.json ~/state.backup.$(date +%s).json

# Reset to a clean council (DESTRUCTIVE — back up first)
rm ~/.agents-council/state.json

# Debug a summon
AGENTS_COUNCIL_SUMMON_DEBUG=1 <run summon> ; tail ./summon-debug.log
```

---

*Next: [Appendix D: Post-Mortem Archive →](D_postmortems.md)*

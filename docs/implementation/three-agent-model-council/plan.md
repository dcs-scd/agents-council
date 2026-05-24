# Three-Agent Model Council Plan

## Objective

Add an autonomous council path that asks Kimi 2.6 and DeepSeek V4 Pro through OpenRouter, asks ChatGPT 5.5 Pro through the locally authenticated OpenAI/Codex subscription path, and returns one synthesized solution.

## Invariants

- Do not store API keys in repository files.
- Keep model IDs configurable by environment.
- Do not change sampling, temperature, token, or context parameters.
- Preserve existing MCP session tools and summon behavior.

## Pipeline Handoff

- Work units: `work-units.md`
- Status ledger: `status-ledger.md`
- Validation: `bun run typecheck`, `bun run build`

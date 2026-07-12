---
name: run-council2
description: >
  Convene the agents-council (default two members — Opus 4.8 + GPT-5.5 xhigh — or
  the full 5-model roster) on a hard decision, design choice, evaluation, or
  paper/plan adjudication, and return the peer-ratified consensus. Wraps
  `council solve` with the run discipline the bare command gets wrong: an
  env-pinned absolute deliberations/ dir, a stale-dist guard, full-roster preflight,
  and reading the per-member verdict instead of the banner. Expensive: two+ paid
  subscriptions, multi-round, several minutes.
when_to_use: >
  When the user wants a multi-model adversarial deliberation — "run the council on
  X", "convene the council", "two-member council on X", "full council on X". Choose
  `full` only when OPENROUTER_API_KEY is set and the gemini CLI is authenticated. NOT
  for single-model questions, and NOT for turning a finished deliberation into a
  HALO-X plan (that is council-to-halo).
disable-model-invocation: true
metadata:
  version: "2.0.0"
---

# run-council2: convene the agents-council, two-member or full

Runs the local agents-council (`/home/dstefanescu/other_systems/o4/agents-council`)
on a prompt and returns the peer-ratified consensus. The council members propose,
deliberate over rounds until the candidate consensus stabilizes, then each
independently **ratifies** or **blocks** it.

| Mode | Roster | Routing | Auth needed |
|---|---|---|---|
| **two** (default) | `claude,chatgpt` — Opus 4.8 (chairs synthesis) + GPT-5.5 @ xhigh | local `claude` + `codex` CLIs | run `claude` once, `codex login` |
| **full** | `claude,chatgpt,kimi,deepseek,gemini` | claude/codex CLIs; kimi+deepseek via **OpenRouter**; gemini via the **gemini CLI** | + `OPENROUTER_API_KEY` and an authenticated `gemini` CLI |

`two` **pins** `AGENTS_COUNCIL_MEMBERS=claude,chatgpt` explicitly. It does **not**
unset the env and trust the engine default — that default silently became a
3-member panel (incl. gemini) on 2026-06-09, and any rebuild re-arms the trap.

> **[HIGH] cost.** A `solve` run spends two or more paid subscriptions across
> multiple deliberation rounds (up to 6) and takes several minutes. This skill is
> `disable-model-invocation: true` — it fires only when the user types it.

## The one command

All run discipline lives in the wrapper (which sources the shared
`run-council-common.sh`). Do not reconstruct the `council solve` incantation by
hand — the wrapper guarantees the correct cwd, the env-pinned deliberations dir,
the stale-dist guard, roster→env mapping, and per-seat preflight.

```bash
# 1. Preflight first (cheap, spends nothing): validates every seat in the roster and
#    prints the resolved roster/runner. Run this before any real convene.
bash ~/.claude/skills/run-council2/run_council.sh check two
bash ~/.claude/skills/run-council2/run_council.sh check full   # also checks OPENROUTER_API_KEY + gemini CLI/auth

# 2. Convene. Quote the whole prompt as one argument, or pass --file for long prompts.
bash ~/.claude/skills/run-council2/run_council.sh two  "Decide the best architecture for ..."
bash ~/.claude/skills/run-council2/run_council.sh full "Adjudicate proposal X against Y ..."
bash ~/.claude/skills/run-council2/run_council.sh two  --file /path/to/prompt.txt
```

**Backgrounding is safe.** The wrapper exports
`AGENTS_COUNCIL_DELIBERATIONS_DIR="$COUNCIL_DIR/deliberations"` (an absolute path),
so the `.json`/`.md` transcript lands under the council repo even for a detached
run — the old cwd-relative EACCES-on-detach failure mode is gone. You may still run
it foreground with a generous timeout; either way the transcript persists.

`--file` is passed **straight through** to the CLI (`council solve --file PATH`),
which reads the file directly and never routes it through argv — so a large brief
does not hit the ~128 KB argv limit.

## Reading the result correctly — do not trust the banner alone

The wrapper prints the human markdown answer to stdout and, on stderr, a start
banner (`council solve: roster=… version=… maxRounds=… deliberations=…`) plus the
saved paths:

```
Saved deliberation record to .../deliberations/council-<ts>.json
Saved Markdown answer to    .../deliberations/council-<ts>.md
```

**Exit code contract:** a `blocked` outcome exits **non-zero (1)** — a hard stop
(an absolute veto or an unresolved claim-ledger precondition). `ratified`,
`ratified_with_edits`, and `not_attempted` all exit **0**. So a zero exit does
**not** by itself mean unanimous ratification; read the saved `.json`:

- `consensus.outcome` — `"ratified"` (every member voted clean ACCEPT),
  `"ratified_with_edits"` (converged with only edit-requests, no veto — the engine
  folds the edits natively), `"blocked"` (≥1 absolute veto), or `"not_attempted"`
  (convergence never detected, so ratify never ran).
- `consensus.ratifiedBy` / `consensus.blockedBy` — who voted which way.

Known pathology on **prose / generative** tasks (vs crisp engineering decisions):
the outcome can read `not_attempted` even when the members substantively agree. So
on prose tasks, **read each member's last `CONSENSUS:` line / final
candidate-consensus text in the transcript**, not just `outcome`. Pull the
structured verdict without dumping the whole transcript into context, e.g.:

```bash
LATEST=$(ls -t /home/dstefanescu/other_systems/o4/agents-council/deliberations/*.json | head -1)
# read outcome + voters from "$LATEST" (jq '.consensus' or a small ctx_execute script)
```

## Writing the prompt — the verdict is bottlenecked by prompt scope

Council members run **sandboxed, read-only, network off**, with cwd pinned to the
council dir, and they decline to crawl the repo. A vague or mis-scoped prompt is the
single biggest cause of a weak or `not_attempted` verdict. Therefore:

- **Pre-fetch any web/external facts** the decision depends on and inline them — members
  cannot browse.
- **Describe the project by research intent + analytics layer**, not by runtime
  hot-paths members can't open.
- **Do not pre-pin a dominant variable** or lead the witness; state the genuine
  disagreement and let them adjudicate.
- Inline any files the decision rests on (the prompt can be large; use `--file`).

## Preconditions

The wrapper's `check` mode validates all of these per-seat and prints what's missing:

- `claude` on PATH and authenticated (run `claude` once). — Opus member.
- `codex login` completed. — GPT member.
- `full` only: `OPENROUTER_API_KEY` exported (kimi + deepseek) **and** the `gemini`
  CLI installed + authenticated (`gemini auth login`, or a `GEMINI_API_KEY`).
- Runner: the wrapper prefers the compiled `./dist/council`, but the **stale-dist
  guard** rejects it (with a loud warning naming both mtimes) whenever a file under
  `src/` is newer, falling back to `bun src/cli/index.ts` (always-current source).
  Rebuild with `bun run build` to use the fast compiled path.

## Not this skill

- Turning a finished deliberation into a HALO-X plan-input brief → use `council-to-halo`.
- Single-model questions, or anything that doesn't warrant the cost of a multi-round
  multi-model run.

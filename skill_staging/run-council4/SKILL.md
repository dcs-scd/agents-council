---
name: run-council4
description: >
  Convene the agents-council with the 4-member, direct-vendor roster — Opus 4.8 +
  GPT-5.5 (xhigh, subscriptions) + Kimi K2.6 (direct Moonshot API) + DeepSeek V4 Pro
  (direct DeepSeek API), NO Gemini — on a hard decision, design choice, paper, or plan,
  and return the peer-ratified consensus. Differs from run-council2 only in roster and
  direct-vendor routing; both now stream the prompt to the engine via `council solve
  --file` (no argv limit).
when_to_use: >
  When the user wants the specific 4-member direct-API council (Opus + GPT-5.5 + Kimi +
  DeepSeek) — "run council4 on X", "4-member council on X", "run the direct-vendor
  council". For the cheaper 2-member or the 5-model OpenRouter+gemini roster, use
  run-council2. NOT for single-model questions, and NOT for turning a finished
  deliberation into a HALO-X plan (that is council-to-halo).
disable-model-invocation: true
metadata:
  version: "2.0.0"
---

# run-council4: convene the 4-member direct-vendor agents-council

Runs the local agents-council (`/home/dstefanescu/other_systems/o4/agents-council`) with
a fixed 4-member roster and direct vendor APIs, and returns the peer-ratified consensus.
Members propose, deliberate over rounds until the candidate consensus stabilizes, then
each independently **ratifies** or **blocks** it.

**Roster (fixed):**

| Member | Model | Path | Auth |
|---|---|---|---|
| claude | Opus 4.8 (chairs synthesis) | `claude` CLI subscription | run `claude` once |
| chatgpt | GPT-5.5 @ xhigh reasoning | `codex` CLI subscription | `codex login` |
| kimi | Kimi K2.6 | **direct Moonshot API** | `MOONSHOT_API_KEY` |
| deepseek | DeepSeek V4 Pro | **direct DeepSeek API** | `DEEPSEEK_API_KEY` |

No Gemini. The wrapper sets `AGENTS_COUNCIL_MEMBERS=claude,chatgpt,kimi,deepseek` and
`AGENTS_COUNCIL_DIRECT_VENDOR_KEYS=1`, which routes kimi→Moonshot and deepseek→DeepSeek
directly instead of through OpenRouter (measured ~2× faster for Kimi than OpenRouter's
Novita routing). The engine also hard-validates the two API keys and errors clearly if
either is missing.

> **[HIGH] cost.** A run spends two paid subscriptions plus two paid vendor APIs across
> multiple deliberation rounds (up to 6) and takes several minutes to tens of minutes.
> The wall-clock stragglers are the **reasoning members** — GPT-5.5 @ xhigh and Opus,
> at up to ~250 s+ per call on hard briefs (Kimi's ~70 s/call is not the long pole).
> The engine's per-call cap is `AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS` (default 300000;
> despite the name it governs the direct-vendor calls too) — raise it when a reasoning
> member times out rather than shrinking the brief first. Size your own Bash timeout
> to the run, not to one call: 6 rounds × 4 members can exceed a default 120 s call
> many times over. This skill is `disable-model-invocation: true`; it fires only when
> the user types it.

## vs run-council2

`run-council2` is the original skill. Use **run-council4** instead of it when you need
the exact 4-member direct-API roster:

- run-council2 `full` = **5** members (adds gemini) via **OpenRouter** (needs
  `OPENROUTER_API_KEY`) + the gemini CLI; run-council4 = **4** members via **direct
  vendor APIs** (`MOONSHOT_API_KEY` + `DEEPSEEK_API_KEY`), no gemini.
- Prompt size is **no longer** a differentiator: both skills now pass the prompt to
  the engine via `council solve --file`, which reads the file directly and bypasses the
  ~128 KB argv limit. (Historically run-council4 owned large briefs because run-council2
  `cat`'d the file into argv; that is fixed.)

Both skills share one run-discipline library (`run-council-common.sh`): the env-pinned
absolute deliberations dir, the stale-dist guard, and the per-seat roster preflight.

## The one command

All run discipline lives in the wrapper. Do not reconstruct the invocation by hand.

```bash
# 1. Preflight first (cheap, spends nothing): validates claude/codex auth + the two
#    API keys per-seat, prints the resolved roster/runner. Run before any real convene.
bash ~/.claude/skills/run-council4/run_council4.sh check

# 2. Convene. Prefer --file for anything non-trivial (this skill is built for large briefs).
bash ~/.claude/skills/run-council4/run_council4.sh run --file /path/to/brief.md
bash ~/.claude/skills/run-council4/run_council4.sh run "A short inline decision prompt..."
```

**Backgrounding is safe.** The wrapper exports
`AGENTS_COUNCIL_DELIBERATIONS_DIR="$COUNCIL_DIR/deliberations"` (an absolute path), so
the `.json`/`.md` transcript lands under the council repo even for a detached run — the
old cwd-relative EACCES-on-detach failure mode is gone. Run it foreground with a generous
timeout or background it; either way the transcript persists.

## Reading the result correctly — do not trust the banner alone

The wrapper prints the human markdown answer to **stdout** and, on **stderr**, a start
banner (`council solve: roster=… version=… maxRounds=… deliberations=…`) plus the saved
paths:

```
Saved deliberation record to .../deliberations/council-<ts>.json
Saved Markdown answer to    .../deliberations/council-<ts>.md
```

**Exit code contract:** a `blocked` outcome exits **non-zero (1)**; `ratified`,
`ratified_with_edits`, and `not_attempted` exit **0**. The authoritative verdict is the
saved `.json`:

- `consensus.outcome` — `"ratified"` (every member voted clean ACCEPT),
  `"ratified_with_edits"`, `"blocked"` (≥1 absolute veto), or `"not_attempted"`.
- `consensus.ratifiedBy` / `consensus.blockedBy` — who voted which way, and edit votes.

```bash
LATEST=$(ls -t /home/dstefanescu/other_systems/o4/agents-council/deliberations/*.json | head -1)
# read outcome + voters + block kinds from "$LATEST" (jq '.consensus' or a small ctx_execute script)
```

Per-member vote *markers* (`CONSENSUS: ACCEPT|ACCEPT_WITH_EDITS|BLOCK`, and for absolute
vetoes `BLOCK_KIND: FACTUAL_ERROR|MATERIAL_DISAGREEMENT`) live in each member's
ratification content — rendered in the saved `.md` under `### <member> — <verdict>`.
Read both when the outcome is contested.

**The engine now folds edits natively — do not fold by hand.** A deliberation that
converges with only `ACCEPT_WITH_EDITS` votes and **no** absolute-veto kind
(`FACTUAL_ERROR` / `MATERIAL_DISAGREEMENT`) is emitted by the engine as
`outcome: "ratified_with_edits"`, with the required edits already folded into the final
consensus artifact. Read that outcome and take the folded artifact as the product; you no
longer reconstruct "blocked + all-ACCEPT_WITH_EDITS ⇒ ratified" yourself. Any
absolute-veto kind present ⇒ genuinely `blocked`, no fold.

**`not_attempted` at near-total agreement is an engine artifact, not a failed
run.** Diagnose before discarding: check the per-round agreement trajectory and the final
`CANDIDATE_CONSENSUS:` text in the transcript. High agreement plus a substantive candidate
consensus means convergence detection missed, not that the council disagreed — use the
candidate-consensus text as the (explicitly unratified) product and label it as such.

**Output plumbing:** the human-readable answer goes to **stdout**; the banner, saved
paths, and outcome go to **stderr**. If your harness truncates or drops stdout, nothing
is lost — the `.md`/`.json` on disk are authoritative (the transcript path is pinned
absolute, so this holds even for a backgrounded run).

## Writing the prompt — the verdict is bottlenecked by prompt scope

Council members run **sandboxed, read-only, network off**, cwd pinned to the council dir,
and they decline to crawl the repo. A vague or mis-scoped prompt is the single biggest
cause of a weak or `not_attempted` verdict. Therefore:

- **Pre-fetch any web/external facts** the decision depends on and inline them — members cannot browse.
- **Inline every file the decision rests on** (the prompt can be huge; pass `--file`).
- **Inline everything load-bearing, but strip the bulk that isn't.** Every member
  re-ingests the whole brief every round under the per-call timeout; an 80k-token
  brief across 6 rounds is exactly where the reasoning members start timing out.
  Large ≠ indiscriminate.
- **Describe the project by research intent + analytics layer**, not by runtime hot-paths members can't open.
- **Do not pre-pin a dominant variable** or lead the witness; state the genuine disagreement and let them adjudicate.
- **If the deliberation will feed `council-to-halo`**, instruct the council to
  state the recommended path and kill-conditions at the TOP of its final
  consensus. The bridge quotes only the first ~4 KB of consensus verbatim; a
  recommendation stated below that cap arrives in the plan brief as `unknown`.

## Preconditions

The wrapper's `check` mode validates all of these per-seat and prints what's missing:

- `claude` on PATH and authenticated (run `claude` once). — Opus 4.8 member.
- `codex login` completed. — GPT-5.5 (xhigh) member.
- `MOONSHOT_API_KEY` exported. — Kimi K2.6 via direct Moonshot API.
- `DEEPSEEK_API_KEY` exported. — DeepSeek V4 Pro via direct DeepSeek API.
- `bun` on PATH. The runner is `council solve` via the stale-dist guard: the compiled
  `./dist/council` when fresh, else `bun src/cli/index.ts` from current source.

Optional: `AGENTS_COUNCIL_MAX_ROUNDS` (default 6) to cap deliberation rounds.

## Not this skill

- The 2-member or 5-model-OpenRouter roster → use `run-council2`.
- Turning a finished deliberation into a HALO-X plan-input brief → use `council-to-halo`.
- Single-model questions, or anything that doesn't warrant the cost of a multi-round, four-endpoint run.

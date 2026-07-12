# LANDING — Lane C skill-wrapper rewrites

These files are STAGED in the worktree. The operator lands them into `~/.claude`
(nothing here writes outside the worktree). Land them together — the two wrappers
source the shared `run-council-common.sh`, so partial landing breaks both.

## 1. File → destination map

| Staged file (in this worktree) | Destination | Action |
|---|---|---|
| `skill_staging/run-council-common.sh` | `~/.claude/skills/run-council-common.sh` | **NEW** (shared, sourced by both wrappers) |
| `skill_staging/run-council2/run_council.sh` | `~/.claude/skills/run-council2/run_council.sh` | OVERWRITE |
| `skill_staging/run-council2/SKILL.md` | `~/.claude/skills/run-council2/SKILL.md` | OVERWRITE |
| `skill_staging/run-council4/run_council4.sh` | `~/.claude/skills/run-council4/run_council4.sh` | OVERWRITE |
| `skill_staging/run-council4/SKILL.md` | `~/.claude/skills/run-council4/SKILL.md` | OVERWRITE |

The wrappers locate the common script relative to their own dir
(`$SCRIPT_DIR/../run-council-common.sh`), so the layout above (common one level
above each skill dir) is required. It resolves identically in-worktree and landed.

Copy + set exec bit on the wrappers (the common script is sourced, exec bit optional):

```bash
WT=/home/dstefanescu/other_systems/council-lanes/wt-c/skill_staging
DST=~/.claude/skills
cp "$WT/run-council-common.sh"          "$DST/run-council-common.sh"
cp "$WT/run-council2/run_council.sh"    "$DST/run-council2/run_council.sh"
cp "$WT/run-council2/SKILL.md"          "$DST/run-council2/SKILL.md"
cp "$WT/run-council4/run_council4.sh"   "$DST/run-council4/run_council4.sh"
cp "$WT/run-council4/SKILL.md"          "$DST/run-council4/SKILL.md"
chmod +x "$DST/run-council2/run_council.sh" "$DST/run-council4/run_council4.sh"
```

## 2. Deletions

| Path | Reason |
|---|---|
| `~/.claude/skills/run-council4/run_council4_driver.ts` | **RETIRED.** The deep-import bun driver existed only to bypass the argv limit. The C1 CLI now reads the prompt via `council solve --file`, so the driver is dead. Delete it. |

```bash
rm -f ~/.claude/skills/run-council4/run_council4_driver.ts
```

## 3. council-to-halo — NOTE ONLY (do not edit here; read-only per spec)

`~/.claude/skills/council-to-halo/` does **not** hard-pin the outcome enum in code:
`~/.claude/halo_x_tools/council_to_brief.py` reads the outcome via
`_opt(consensus.get("outcome"))` (any string passes through; `UNKNOWN` when absent),
so a new `ratified_with_edits` outcome (Lane A) flows into the brief with **no code
change required**.

However, `council-to-halo/SKILL.md` (Step 3, ~lines 146–153) still tells the reader to
*manually reinterpret* a `blocked` outcome whose blocks are all `ACCEPT_WITH_EDITS` as a
successful deliberation. Once Lane A ships native `ratified_with_edits`, that manual
reinterpretation is superseded for the edit case: such a run now arrives already labeled
`ratified_with_edits`, and only a genuine veto remains `blocked`.

**Recommended follow-up (separate change, not in this lane):** update
`council-to-halo/SKILL.md` Step 3 to say "a `ratified_with_edits` brief needs no
reinterpretation; only a `blocked` outcome carrying an absolute-veto kind is a real veto."
No `council_to_brief.py` change is needed.

## 4. Re-check after Lanes A + B merge

The rewritten SKILL.md docs describe the **post-merge end state**:

- **Lane A — `ratified_with_edits` outcome.** Both SKILL.md files now document
  `ratified_with_edits` as a native outcome (exit 0; edits folded by the engine). If
  Lane A's final outcome name or exit-code mapping differs, re-check: the exit-code
  contract these docs assert is `blocked → 1`, everything else `→ 0`
  (`src/core/services/modelCouncil.ts::councilOutcomeExitCode`). Confirm Lane A maps
  `ratified_with_edits → 0` there.
- **Lane B — new env vars.** If Lane B adds env vars that the wrappers should export or
  the docs should mention, fold them into `run-council-common.sh` / the preconditions
  sections after merge.

## 5. Smoke test (operator gate — run after landing)

```bash
# 1. Syntax of both wrappers + the sourced common script.
bash -n ~/.claude/skills/run-council-common.sh && bash -n ~/.claude/skills/run-council2/run_council.sh && bash -n ~/.claude/skills/run-council4/run_council4.sh && echo "syntax OK"
# 2. Driver is gone.
test ! -e ~/.claude/skills/run-council4/run_council4_driver.ts && echo "driver deleted OK"
# 3. Preflight only (spends nothing) — prints resolved roster/runner/deliberations, exits 0 when the roster's seats are all present.
bash ~/.claude/skills/run-council2/run_council.sh check two
bash ~/.claude/skills/run-council4/run_council4.sh check
# 4. Tiny real convene (SPENDS — two subscriptions): expect a "council solve: roster=claude,chatgpt …" banner on stderr and a ratified answer on stdout.
bash ~/.claude/skills/run-council2/run_council.sh two "Reply with the single word OK and ratify it."
```

Expected: step 3 prints a banner like
`>>> roster=two (claude,chatgpt)  runner=./dist/council  cwd=…  deliberations=…/agents-council/deliberations`
and `>>> preflight OK — ready to run.` when `claude` + `codex` are on PATH.

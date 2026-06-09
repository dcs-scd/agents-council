# WU-B8 — Update `docs/council.md` (plain doc) — execution

- **unit:** WU-B8
- **state:** done @ 2026-06-09
- **taxonomy:** docs
- **depends_on:** WU-B1, WU-B2, WU-B3, WU-B4, WU-B5, WU-B6, WU-B7 (all done)
- **gate(s):** `gate_mdoc_clean` → **done**; contributes to `gate_regression` (stays **planned**, acceptance-owned)
- **invariant:** documentation faithfulness to the shipped structured subsystem

## Change

`docs/council.md` extended with a single new top-level section,
**"Structured deliberation subsystem (Claim-Ledger Delphi)"**, inserted immediately before the
existing `## SDK Requirement` section. Plain Markdown, matching the doc's existing prose +
fenced-block + table style. No other file touched.

The section is grounded line-by-line in the `_reports/WU-*-execution.md` evidence and the shipped
code; it does not restate machine artifacts beyond what the doc reader needs.

## Coverage (each required item → where it is documented)

| Item | Section in council.md | Faithful to |
|---|---|---|
| Structured path + `AGENTS_COUNCIL_STRUCTURED`, default OFF / opt-in, flag-off byte-for-byte legacy, single impl (no fork) | "Opt-in flag" | INV-2, INV-7; WU-B1 report |
| Typed `Claim{id,text,provenance,evidence[],severity?}`, provenance enum `repo_fact\|source_claim\|assumption`, JSON mode, Zod-parse-fail → text fallback + parse-fail counter, Zod bundled in dist | "Typed claim schema and text fallback" | WU-B1 report (evidence a/b/c/d) |
| Level-1 `SOURCE_ID_MISMATCH` (repo_fact citing absent/empty pack id) → absolute `FACTUAL_ERROR` block; `UNLABELED_CLAIM`; `ASSUMPTION_NO_VERIFICATION`; pure/deterministic; blocks enter only ratifications | "Provenance / Level-1 source-ID block precondition" | WU-B2 report; INV-4, INV-9, INV-3 |
| Wave-B heuristic boundaries (unlabeled unreachable via applier; assumption always blocks — no `cheapest_verification` field) | "Wave-B heuristic boundaries (FYI)" | WU-B2 report FYIs 1 & 2 |
| Optional `evidencePack{id,text,source}[]` prepended to round-0 proposals; byte-identical legacy when absent; plumbing only | "Evidence-pack input" | WU-B3 report; INV-2 |
| `DEFAULT_MEMBER_IDS=[claude,chatgpt,gemini]` odd≥3 heterogeneous default; `AGENTS_COUNCIL_MEMBERS` override; n=2 draft path; config-only | "Odd-roster default" | WU-B7 report |
| `minorityReport[]` (`MinorityReportEntry`) on result + `## Minority Report` MD section, emitted on `blocked` only; CLI non-zero exit on `blocked` | "Minority-report artifact" | WU-B4 report |
| `trace-{ts}.json` (`council_trace.v1`), `council_to_brief.py` consumer contract, **equal member weights (==1)** | "Structured trace artifact" | WU-B5 report |
| `issue-map-{ts}.json` (`issue_map.v1`), deterministic exact-match agreed/contested partition, **controls nothing** (INV-3), no embeddings | "Observational issue map (controls nothing)" | WU-B6 report; INV-3, INV-5 |
| New env vars `AGENTS_COUNCIL_STRUCTURED`, `AGENTS_COUNCIL_MEMBERS` | "New environment variables" table | WU-B1/B7 reports |
| Enum-freeze (INV-6): top-level outcome stays `not_attempted\|ratified\|blocked`; `qualified_consensus` deferred/nested-only | "Top-level outcome enum is frozen" | WU-B4 report; INV-6 |
| Wave-C entry-gate cross-link (parse-fail < 5% over ≥50 runs AND beats self-consistency; on-fail downgrade) | "Graduation gate (Wave C)" | work-units.md deferred_work |

## What was NOT done (by constraint)

- No source or test file changed (docs-only unit).
- No `.claude/state/mdocs.json` and no MDOC stub created — agents-council is a nested repo with
  **no MDOC registry**; `docs/council.md` is a plain Markdown doc with no scope-signature tracking.
- No documented model parameter values altered (Hard Rule 1) — the doc describes what exists.

## Validation

- **`bun run format:check`:** unchanged from HEAD — `Checked 81 files`, `Found 1 error`, with the
  only reds being the three pre-existing/unrelated files (`harness/run_tier5_scheduling_council.ts`,
  `harness/model_council_result_r5.json`, `council_runs/*.json`), all byte-identical to HEAD and
  untouched. `docs/council.md` is Markdown and is **not** in biome's formatter set (only JS/TS/JSON
  are checked), so the docs change introduces **no new red**.
- **`git status`:** the only working-tree source/doc change is `docs/council.md` (plus the WU-B8
  ledger/report/notes artifacts).

## Ledger / gate updates

- `status-ledger.md`: WU-B8 row `ready → done`; counts `done=9, ready=0`; new "handoff WU-B8"
  block in `## Canonical state`; `units.WU-B8: done`; `gates.gate_mdoc_clean: done`;
  `gate_mdoc_clean` gates-table row → **done** with the coverage evidence; gate_regression cell
  annotated with the WU-B8 docs-only contribution (no new format:check red).
- `gate_regression` left **planned** (acceptance evaluates it).
- **NOT** set to `accepted`/`regressed` — acceptance owns those.

## Final tallies

- Units: **9/9 done** (A1, B1, B2, B3, B4, B5, B6, B7, B8).
- Gates: `gate_no_bearer`, `gate_zod_bundled`, `gate_schema_fallback`, `gate_planted_claim`,
  `gate_minority_report`, `gate_issue_map_observational`, `gate_mdoc_clean` → **done**;
  `gate_regression` → **planned** (acceptance-owned).

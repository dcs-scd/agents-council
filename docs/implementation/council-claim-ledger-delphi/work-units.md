# Work Units — Claim-Ledger Delphi (Wave A + Wave B)

- **plan_id:** `council-claim-ledger-delphi`
- **plan_path:** `docs/implementation/council-claim-ledger-delphi/implementation-plan.md`
- **artifact_root:** `docs/implementation/council-claim-ledger-delphi/`
- **repo / HEAD:** `agents-council` @ `feat/council-consensus-hardening` tip `fbfc9e8` (worktree `agents-council-worktrees/council-claim-ledger`)
- **engine touchpoint:** `src/core/services/modelCouncil.ts` (1667L) + new `src/core/services/council/schemas.ts`; test surface `src/core/services/modelCouncil.test.ts` (1007L)
- **decompose note:** 9 work units, 1:1 with the plan's WP table (no WP needs sub-splitting — each has one dominant purpose and a single taxonomy category). Wave C (`deferred_work`) is recorded as deferred and is **not** decomposed into units. `perf_critical: false` and `native_acceleration.enabled: false`, so no `WU-PERF-*` / `WU-RUST-*` workstreams. `mdoc_targets: []` (nested repo, no MDOC registry), so `gate_mdoc_clean` is a plain-doc gate; Phase 6.5 MDOC materialization is a no-op.

---

## WU-A1 — Remove Bearer from curl argv

- **taxonomy_category:** runtime
- **gate(s):** `gate_no_bearer`, `gate_regression`
- **depends_on:** —
- **can_run_with:** WU-B1, WU-B3, WU-B7 (disjoint touchpoints: network shell-out vs schema module vs evidence-pack arg vs roster config)
- **state:** ready
- **invariants:** INV-1 (no-Bearer-in-argv), INV-8 (regression green)
- **primary touchpoints:** `fetchTextWithTimeout` (L915), `Bun.spawn(["curl", ...args])` (L945); callers `askOpenRouter` (Bearer L746), `askDirectChatProvider` (Bearer L837); preserve `resolveOpenRouterTimeoutMs` (L999).
- **brief:**
  - **Change:** keep `Bearer` out of spawned argv. Pass auth via `curl -K -` reading `header = "Authorization: Bearer …"` from **stdin**, or a `0600` temp file unlinked immediately post-spawn. Preserve timeout semantics for both providers.
  - **Root-cause probe (preferred if clean):** the curl shell-out exists only to dodge a Bun `fetch()` hang diagnosed 2026-05-28 (comment near L911). Feature-detect: if the hang no longer reproduces, drop the curl path and use `fetch()`. **Record the probe result in the WU evidence** (open question #2 in the plan); do not silently keep curl if `fetch()` is viable.
  - **Do NOT change:** retry loops (`OPENROUTER_MAX_ATTEMPTS=3`, L730/L759/L845 — P0-3 parity already shipped), timeout resolution, any convergence/ratification code.
  - **Evidence to return:** unit test asserting the spawned argv (captured via a `Bun.spawn` shim/spy) contains no `Bearer`; existing OpenRouter timeout tests (`modelCouncil.test.ts` L156 / L183) stay green; a manual `ps`/`/proc` argv-inspection note.
  - **Tests to run:** new no-Bearer argv test; `bun run typecheck`; `bun run format:check`; `modelCouncil.test.ts`.
- **non-goals:** any structured/Zod work; any change to retry/timeout numeric parameters.

---

## WU-B1 — Zod claim/response schemas + text fallback

- **taxonomy_category:** contract
- **gate(s):** `gate_schema_fallback`, `gate_zod_bundled`
- **depends_on:** —
- **can_run_with:** WU-A1, WU-B3, WU-B7
- **state:** ready
- **invariants:** INV-2 (legacy default / flag-gated), INV-7 (single implementation, no fork), INV-8 (regression green)
- **primary touchpoints:** new file `src/core/services/council/schemas.ts`; fallback wiring into `parseRatificationVote` (L1322), `parseCandidateConsensus` (L1371), `parseConsensusSignal` (L1398/L1402).
- **brief:**
  - **Change:** add `schemas.ts` defining `Claim{id, text, provenance: repo_fact|source_claim|assumption, evidence: string[], severity?}`, `IndependentProposal`, `DeliberationResponse`, `RatificationVote`. Request JSON mode where the provider supports it; on Zod parse failure fall back to the existing text parsers and log a per-run parse-fail rate. **All reachable only under `AGENTS_COUNCIL_STRUCTURED` (default off).**
  - **Do NOT change:** legacy text-parse behavior when the flag is off (must stay byte-for-byte for the regression suite); the live convergence controller.
  - **Evidence to return:** (a) valid structured payload parses to the typed object; (b) malformed payload falls through to the text parser and increments the parse-fail counter; (c) flag-off path never imports/touches the schema module; (d) `gate_zod_bundled`: build via `bun build --compile` and exercise a schema parse **from the compiled binary** (resolves open question #1 — Zod is in `devDependencies`).
  - **Tests to run:** schema unit tests (a/b/c); compiled-binary parse check; `bun run typecheck`; `bun run format:check`; `modelCouncil.test.ts`.
- **non-goals:** the provenance/Level-1 block logic (WU-B2); trace persistence (WU-B5); any controller change.

---

## WU-B3 — Evidence-pack input plumbing

- **taxonomy_category:** runtime
- **gate(s):** `gate_regression`
- **depends_on:** —
- **can_run_with:** WU-A1, WU-B1, WU-B7
- **state:** ready
- **invariants:** INV-2, INV-8
- **primary touchpoints:** optional `evidencePack: {id, text, source}[]` arg on `runModelCouncil` (L276); prepend to proposal system messages in `buildProposalMessages` (L1164).
- **brief:**
  - **Change:** add the optional `evidencePack` argument and inject it into round-0 proposal system messages. **Plumbing only** — pack generation is out of scope.
  - **Do NOT change:** prompt bytes when no pack is supplied (must stay byte-identical to legacy).
  - **Evidence to return:** unit test — a supplied pack appears in the round-0 system message; omitting the pack leaves prompts byte-identical to legacy.
  - **Tests to run:** evidence-pack injection test; `bun run typecheck`; `bun run format:check`; `modelCouncil.test.ts`.
- **non-goals:** the Level-1 source-ID check (WU-B2 consumes these pack IDs); evidence-pack content generation.

---

## WU-B2 — Provenance-label + Level-1 source-ID block precondition

- **taxonomy_category:** runtime
- **gate(s):** `gate_planted_claim`, `gate_regression`
- **depends_on:** WU-B1, WU-B3
- **can_run_with:** —
- **state:** blocked (needs WU-B1 schema contract and WU-B3 evidence-pack IDs)
- **invariants:** INV-4 (typed/absolute vetoes preserved — keep `FACTUAL_ERROR` absolute), INV-9 (Level-1 source-ID is pure code, no LLM/sandbox), INV-2, INV-8
- **primary touchpoints:** in front of `parseRatificationVote` (L1322) and the ratification precondition path; reuse existing `BLOCK_KIND`.
- **brief:**
  - **Change (best-effort in Wave B, heuristic until parse-rate validated):**
    - an unlabeled factual claim → block precondition;
    - an `assumption` with no stated `cheapest_verification` → block precondition;
    - **Level-1 deterministic source-ID check** (Addendum A.3.3): a `repo_fact` claim whose cited evidence-pack ID is **not** present in the supplied pack → block precondition. Pure code, no LLM, no sandbox.
  - **Do NOT change:** the live convergence controller; the absoluteness of `FACTUAL_ERROR`/`MATERIAL_DISAGREEMENT` vetoes; do NOT build a Level-2 tool/LLM verifier (Wave C).
  - **Evidence to return:** planted-false-claim test — inject an unlabeled false repo claim AND a `repo_fact` citing a non-existent pack ID; assert both are flagged/blocked. Existing ratification tests stay green.
  - **Tests to run:** planted-claim test; `bun run typecheck`; `bun run format:check`; `modelCouncil.test.ts`.
- **non-goals:** Level-2 verifier; minority-report emission (WU-B4 consumes these blocks).

---

## WU-B4 — Minority report as first-class artifact

- **taxonomy_category:** runtime
- **gate(s):** `gate_minority_report`, `gate_regression`
- **depends_on:** WU-B2
- **can_run_with:** —
- **state:** blocked (block precondition from WU-B2 feeds dissent)
- **invariants:** INV-6 (enum freeze — do NOT add `qualified_consensus` to the top-level enum), INV-8
- **primary touchpoints:** extend `ConsensusResult` / `buildConsensusResult` (L1595) and `formatModelCouncilMarkdown` (L469) with `minorityReport[]`; CLI exit-code path.
- **brief:**
  - **Change:** add `minorityReport[]` to the consensus result and Markdown formatter; emit on `blocked`. CLI exits **non-zero** on `blocked`. Minority reports key off `blocked` now (`qualified_consensus` is nested-only and deferred).
  - **Do NOT change:** the top-level outcome enum (`not_attempted|ratified|blocked` stays frozen — INV-6).
  - **Evidence to return:** one absolute veto preserves dissent in **both** JSON and Markdown; CLI exit code is non-zero on `blocked`.
  - **Tests to run:** minority-report JSON+MD test; CLI exit-code test; `bun run typecheck`; `bun run format:check`; `modelCouncil.test.ts`.
- **non-goals:** introducing `qualified_consensus` to the top-level enum; any controller change.

---

## WU-B5 — Structured trace logging (no learner)

- **taxonomy_category:** runtime
- **gate(s):** `gate_regression`
- **depends_on:** WU-B1
- **can_run_with:** WU-B6 (both touch `saveModelCouncilRun` but write distinct artifacts; sequence if they collide on the same function edit)
- **state:** blocked (needs WU-B1 schema-validated claims)
- **invariants:** INV-2, INV-8
- **primary touchpoints:** `saveModelCouncilRun` (L561) — persist per-claim / per-member / per-round structured traces + outcome alongside the existing `council-{ts}.json/.md`.
- **brief:**
  - **Change:** write a structured trace file under the flag. **Equal member weights — never weight by prestige.** Consumer contract = `deliberations/*.json` (already consumed by external `~/.claude/halo_x_tools/council_to_brief.py`).
  - **Do NOT change:** member weighting; the existing `council-{ts}.json/.md` schema; legacy flag-off output.
  - **Evidence to return:** a flag-on run writes a trace file whose schema matches the documented contract; a downstream `council_to_brief.py` parse smoke (or a fixture asserting the field shape) succeeds.
  - **Tests to run:** trace-schema fixture/smoke; `bun run typecheck`; `bun run format:check`; `modelCouncil.test.ts`.
- **non-goals:** any learner / weighting; the issue-map artifact (WU-B6).

---

## WU-B6 — Observational issue-map artifact (non-controlling)

- **taxonomy_category:** evaluator
- **gate(s):** `gate_issue_map_observational`, `gate_regression`
- **depends_on:** WU-B1
- **can_run_with:** WU-B5 (see WU-B5 collision note)
- **state:** blocked (needs WU-B1 schema-validated claims)
- **invariants:** INV-3 (issue map controls nothing — F3 self-report stays the only live controller), INV-5 (deterministic code, no LLM mediator), INV-8
- **primary touchpoints:** `saveModelCouncilRun` (L561) — parse schema-validated claims into a deterministic (normalized exact-match) agreed/contested issue map and persist `issue-map-{ts}.json` next to `council-{ts}.json/.md`.
- **brief:**
  - **Change (Addendum A.5 default = BUILD construction):** ~80–150 LOC exact-match clustering producing an agreed/contested partition, persisted as `issue-map-{ts}.json`. It is the **instrument** for the Wave-C entry-gate evidence (misclustering rate, false-consensus cases).
  - **Cut-line (user may veto to keep Wave B lean):** drop issue-map *construction* and log only raw schema-validated per-member claims; the WU records which path was taken. Default = build construction.
  - **Do NOT change:** the controller — the map must be **never** read by `isConverged`/ratification (INV-3). No embeddings (none present; exact-match only).
  - **Evidence to return:** `gate_issue_map_observational` — a fixture with known agreed/contested claims yields the expected partition; a test asserts the map is **never** consulted by `isConverged`/ratification (controller-isolation assertion).
  - **Tests to run:** partition fixture test; controller-isolation assertion; `bun run typecheck`; `bun run format:check`; `modelCouncil.test.ts`.
- **non-goals:** making the issue map a controller (Wave C); embeddings; dispute packets.

---

## WU-B7 — Odd-roster default (config-only)

- **taxonomy_category:** runtime
- **gate(s):** `gate_regression`
- **depends_on:** —
- **can_run_with:** WU-A1, WU-B1, WU-B3
- **state:** ready
- **invariants:** INV-8
- **primary touchpoints:** `buildDefaultMembers` (L633) + `selectConfiguredMembers` (L673); `AGENTS_COUNCIL_MEMBERS`.
- **brief:**
  - **Change:** default to odd n ≥ 3 heterogeneous roster for decision tasks; keep n = 2 for cheap drafts. **Config-only — no protocol code change.**
  - **Do NOT change:** any protocol/convergence/ratification code; the n=2 cheap-draft path.
  - **Evidence to return:** default config resolves to an odd ≥3 heterogeneous roster; explicit `AGENTS_COUNCIL_MEMBERS=2` still yields n=2.
  - **Tests to run:** roster-default test; explicit-override test; `bun run typecheck`; `bun run format:check`; `modelCouncil.test.ts`.
- **non-goals:** any protocol change; any controller change.

---

## WU-B8 — Update `docs/council.md` (plain doc)

- **taxonomy_category:** docs
- **gate(s):** `gate_mdoc_clean`
- **depends_on:** WU-B1, WU-B2, WU-B3, WU-B4, WU-B5, WU-B6, WU-B7 (all B-series code lands first)
- **can_run_with:** —
- **state:** blocked (after the B-series code units)
- **invariants:** (documentation faithfulness to the shipped structured subsystem)
- **primary touchpoints:** `docs/council.md` (plain Markdown — agents-council has **no** MDOC registry; no scope-signature tracking).
- **brief:**
  - **Change:** document the structured path, `AGENTS_COUNCIL_STRUCTURED`, the provenance-label/Level-1 precondition, the minority-report artifact, the observational issue map, the new env vars, and the enum-freeze decision. Cross-link the Wave-C entry gate.
  - **Do NOT change:** any source/test; do NOT create `.claude/state/mdocs.json` or an MDOC stub (nested repo has no MDOC system).
  - **Evidence to return:** `docs/council.md` diff covering each item above.
  - **Tests to run:** none beyond `bun run format:check` if it lints Markdown; otherwise N/A.
- **non-goals:** authoring MDOC bodies; any code change.

---

## Deferred work — Wave C (NOT decomposed; recorded only)

Hard-gated structural tier; recorded by the plan's `deferred_work`, **not** authored as buildable units here. Members: P1-2 issue-map-as-controller + targeted dispute packets; P1-3' claim-ledger convergence (zero open high-severity contested claims); P1-5 Level-2 source-check verifier (`mcp__verify__`, read-only, allowlisted); P1-4 task-type router; A.3.2 broad benchmark portfolio eval.

**Entry gate (both required):** (a) structured-output parse-fail rate < 5% over ≥ 50 sample runs; (b) structured council beats self-consistency on the benchmark distribution (union of repo Wave-B gates + external portfolio). **On fail:** downgrade issue map to audit-only, keep F3 self-report + P0-2 label gate, stop.

The Wave C benchmark campaign is the project's only performance-relevant surface and must be planned as its own perf-critical campaign if/when built. The authored Wave A+B build is **not** performance-critical.

---

## Gate mapping

| Gate | Contributing units |
|---|---|
| `gate_no_bearer` | WU-A1 |
| `gate_zod_bundled` | WU-B1 |
| `gate_schema_fallback` | WU-B1 |
| `gate_planted_claim` | WU-B2 |
| `gate_minority_report` | WU-B4 |
| `gate_issue_map_observational` | WU-B6 |
| `gate_regression` | WU-A1, WU-B1, WU-B2, WU-B3, WU-B4, WU-B5, WU-B6, WU-B7 |
| `gate_mdoc_clean` | WU-B8 |

---

## Pipeline handoff

```yaml
schema_version: 1
plan_id: council-claim-ledger-delphi
plan_path: docs/implementation/council-claim-ledger-delphi/implementation-plan.md
artifact_root: docs/implementation/council-claim-ledger-delphi/
repo: agents-council
branch: feat/council-consensus-hardening
head_sha: fbfc9e8
worktree: agents-council-worktrees/council-claim-ledger
mode: C
unit_count: 9
ready_units:
  - WU-A1
  - WU-B1
  - WU-B3
  - WU-B7
blocked_units:
  - WU-B2
  - WU-B4
  - WU-B5
  - WU-B6
  - WU-B8
deferred_units: []
invariants:
  - id: INV-1
    text: No spawned child process argv contains Bearer.
  - id: INV-2
    text: Legacy text path is default; structured path reachable only under AGENTS_COUNCIL_STRUCTURED; flag-off restores legacy behavior.
  - id: INV-3
    text: isConverged (F3 self-reported CONSENSUS_STATUS, draft-overlap fallback) remains the only live convergence controller in Wave A+B; issue map controls nothing.
  - id: INV-4
    text: buildCandidateConsensus no-dictator nomination and parseRatificationVote typed/absolute vetoes (F2, F7) preserved.
  - id: INV-5
    text: Issue map and claim clustering are deterministic code; no LLM mediator with decision authority.
  - id: INV-6
    text: Top-level outcome enum frozen at not_attempted|ratified|blocked; qualified_consensus nested-only and deferred.
  - id: INV-7
    text: Additive modules wired into runModelCouncil; no parallel delphiCouncil.ts fork.
  - id: INV-8
    text: modelCouncil.test.ts green; bun run typecheck and bun run format:check clean.
  - id: INV-9
    text: repo_fact claims cite an evidence-pack ID; Level-1 source-ID check is pure code, no LLM, no sandbox.
gates:
  - id: gate_no_bearer
    state: planned
    asserts: No spawned child argv contains Bearer (unit test over Bun.spawn shim).
  - id: gate_zod_bundled
    state: planned
    asserts: Zod is bundled into compiled dist/council or promoted to dependencies; verified from the compiled binary.
  - id: gate_schema_fallback
    state: planned
    asserts: Malformed structured payload falls back to text parser and increments parse-fail counter; flag-off never imports schema module.
  - id: gate_planted_claim
    state: planned
    asserts: Planted unlabeled false claim and repo_fact citing a non-existent pack ID are both flagged/blocked.
  - id: gate_minority_report
    state: planned
    asserts: blocked run emits minorityReport[] in JSON and Markdown; CLI exit non-zero.
  - id: gate_issue_map_observational
    state: planned
    asserts: Issue map partitions a known fixture correctly and is never consulted by the convergence/ratification controller.
  - id: gate_regression
    state: planned
    asserts: modelCouncil.test.ts green; typecheck clean; format:check clean; legacy-default behavior unchanged.
  - id: gate_mdoc_clean
    state: planned
    asserts: docs/council.md updated to document the structured subsystem (plain doc; agents-council has no MDOC registry, so no scope-signature check).
gate_mapping:
  gate_no_bearer:
    - WU-A1
  gate_zod_bundled:
    - WU-B1
  gate_schema_fallback:
    - WU-B1
  gate_planted_claim:
    - WU-B2
  gate_minority_report:
    - WU-B4
  gate_issue_map_observational:
    - WU-B6
  gate_regression:
    - WU-A1
    - WU-B1
    - WU-B2
    - WU-B3
    - WU-B4
    - WU-B5
    - WU-B6
    - WU-B7
  gate_mdoc_clean:
    - WU-B8
workstream_order:
  - contract
  - runtime
  - evaluator
  - docs
gate_order:
  - gate_no_bearer
  - gate_zod_bundled
  - gate_schema_fallback
  - gate_planted_claim
  - gate_minority_report
  - gate_issue_map_observational
  - gate_regression
  - gate_mdoc_clean
parallel_acceptance_allowed: false
first_execution: WU-B1
deferred_work:
  - id: wave-c
    title: Structural claim-ledger controller tier (hard-gated)
    members:
      - P1-2 issue-map-as-controller + targeted dispute packets
      - P1-3' claim-ledger convergence (zero open high-severity contested claims)
      - P1-5 Level-2 source-check verifier (mcp__verify__, read-only, allowlisted)
      - P1-4 task-type router
      - A.3.2 broad benchmark portfolio eval
    entry_gate:
      - parse_fail_rate_lt_5pct_over_50_runs
      - beats_self_consistency_union_repo_and_external_benchmarks
    on_fail: Downgrade issue map to audit-only; keep F3 self-report + P0-2 label gate; stop.
mdoc_targets: []
mdoc_targets_materialized: []
severity_floor: high
terminal_review:
  target: agents-council-worktrees/council-claim-ledger
  components:
    - src/core/services/modelCouncil.ts
    - src/core/services/council/schemas.ts
    - src/core/services/council/
    - src/core/services/modelCouncil.test.ts
  focus: credential-leak elimination, structured-path additivity/flag-gating, issue-map controller-isolation, no-dictator/typed-veto preservation, enum freeze, no parallel fork
  budget: medium
  impact_radius: src/core/services/ and the deliberations/*.json consumer contract
acceptance_checklist: default
perf_critical: false
perf_budget: []
performance_architecture: null
native_acceleration:
  enabled: false
next_recommended_command: /execute-work-units docs/implementation/council-claim-ledger-delphi/work-units.md WU-B1
```

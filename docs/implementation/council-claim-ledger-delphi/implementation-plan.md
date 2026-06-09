# Claim-Ledger Delphi — Wave A + Wave B implementation plan

- **plan_id:** `council-claim-ledger-delphi`
- **artifact_root:** `docs/implementation/council-claim-ledger-delphi/`
- **mode:** C (merged — faithful council brief `PLAN_INPUT_BRIEF.md` + operator reconciliation `OPERATOR_SCOPE_AND_GROUNDING.md` incl. Addendum A from `consensus_v2.md`)
- **repo / HEAD:** `agents-council` @ `feat/council-consensus-hardening` tip `fbfc9e8` (worktree `agents-council-worktrees/council-claim-ledger`)
- **codegraph:** agents-council is **not** codegraph-indexed (root index resolved 0/7 symbols); all line refs below are hand-verified against live source at `fbfc9e8` (see §"Grounding verification").

> **Authority note.** The operator scope file's **Addendum A** takes precedence over its §1–§8 where they conflict, and over the raw council brief where the brief is stale. Two stale claims from the brief are dropped here (P0-3 retry parity; the Jaccard-demotion half of P1-3) — see §Excluded.

---

## Objectives

Make the *labeled claim* — not the prose draft — the auditable unit the council records, and remove a live credential-leak, **without** changing the active convergence/ratification controller in the shipping waves. Two enforceable, independently shippable halves are authorized:

1. **Wave A (security, zero protocol risk):** stop leaking `Authorization: Bearer <key>` through `curl` argv.
2. **Wave B (provenance + structured foundation, additive, flag-gated):** Zod claim/response schemas with text fallback; a best-effort provenance-label + Level-1 deterministic source-ID precondition in front of ratification; evidence-pack plumbing; first-class minority reports; an odd-roster default; structured trace logging plus an **observational, non-controlling** deterministic issue-map artifact that becomes the Wave-C entry-gate instrument.

Everything structural that would *change the controller* (issue-map-as-controller, claim-ledger convergence replacing F3 self-report, the Level-2 tool verifier, the task-type router) is **deferred and hard-gated as Wave C** — recorded here, **not** authored as buildable.

## Target outcome

- No spawned child process argv contains `Bearer`.
- A `src/core/services/council/schemas.ts` module exists; structured parsing is wired into `runModelCouncil` behind `AGENTS_COUNCIL_STRUCTURED`, defaulting **off**, with text-parse fallback and a logged parse-fail rate.
- An unlabeled factual claim, or an `assumption` with no cheapest-verification step, or a `repo_fact` whose cited evidence-pack ID is absent from the supplied pack, is flagged as a ratification block precondition (best-effort in Wave B).
- `runModelCouncil` accepts an optional `evidencePack` and injects it into round-0 proposal prompts.
- `blocked` runs emit a first-class `minorityReport[]` in both JSON and Markdown; the CLI exits non-zero on `blocked`.
- The default roster is odd, n ≥ 3, heterogeneous for decision tasks (config-only); n = 2 retained for cheap drafts.
- `saveModelCouncilRun` additionally writes `issue-map-{ts}.json` (observational; controls nothing).
- The top-level outcome enum is **frozen** at `not_attempted | ratified | blocked`. `qualified_consensus` is introduced **only** as a nested semantic field, deferred until downstream readers are audited (Wave C).
- The Wave-C entry gate is recorded with its measurement instrument (the Wave B issue map) and its two-part go/no-go.

## Invariants (carry into every work unit and acceptance)

- **INV-1 (no-Bearer-in-argv):** no spawned child argv contains `Bearer`. Asserted by unit test.
- **INV-2 (legacy default):** the legacy text path is the default; the structured path is reachable only under `AGENTS_COUNCIL_STRUCTURED`. Removing/unsetting the flag must restore byte-for-byte legacy behavior for the regression suite.
- **INV-3 (controller unchanged in A+B):** `isConverged` (F3 self-reported `CONSENSUS_STATUS`, draft-overlap fallback) remains the **only** live convergence controller through Wave A+B. No work unit may make the issue map, Jaccard, or any new signal control stopping/ratification. (De-stale guard: "keep the current controller" means keep the F3 self-report controller — never re-introduce a Jaccard controller.)
- **INV-4 (no-dictator, typed-veto preserved):** `buildCandidateConsensus` peer-derived nomination and `parseRatificationVote` typed/absolute vetoes (F2 ratify-on-candidate, F7 `FACTUAL_ERROR`/`MATERIAL_DISAGREEMENT` absolute) are preserved unchanged.
- **INV-5 (no LLM mediator with authority):** the issue map and any claim clustering are built in **deterministic code** (normalized exact-match), never by an LLM with decision power.
- **INV-6 (enum freeze):** top-level outcome stays `not_attempted | ratified | blocked` in A+B; `qualified_consensus` is nested-only and deferred.
- **INV-7 (single implementation):** wire additive modules into `runModelCouncil`; **no** parallel `delphiCouncil.ts` fork (agents-council CLAUDE.md simplicity-first).
- **INV-8 (regression green):** `modelCouncil.test.ts` (1007L) stays green; `bun run typecheck` and `bun run format:check` clean.
- **INV-9 (provenance labels, not paraphrase):** `repo_fact` claims must cite an evidence-pack ID; the Level-1 check is pure code (no LLM, no sandbox).

## Excluded — already shipped on `fbfc9e8` (do NOT re-plan)

| Brief item | Brief claim | Verified state @ `fbfc9e8` | Action |
|---|---|---|---|
| **P0-3** direct-provider retry parity | Moonshot/DeepSeek lack the 3× retry | FALSE — `askDirectChatProvider` (L845 loop) is identical to `askOpenRouter` (L759 loop); same `OPENROUTER_MAX_ATTEMPTS=3` (L730). | **DROP.** |
| **P1-3** "demote Jaccard to telemetry" | Jaccard convergence is the #1 defect | DONE (F3) — comments L97–99 confirm Jaccard is telemetry-only; `isConverged` keys on self-reported `CONSENSUS_STATUS`. | **DROP the demotion.** Claim-ledger convergence upgrade survives as Wave C / P1-3'. |
| **F2** ratify-on-candidate / **F7** absolute vetoes | preserve | present + tested | **Preserve (INV-4).** |

## Package dependency graph

```
WP-A1 (runtime: bearer fix) ──────────────── independent, ships alone

WP-B1 (contract: Zod schemas) ──┬──> WP-B2 (runtime: label + Level-1 gate)
                                ├──> WP-B6 (evaluator: issue-map artifact)
                                └──> WP-B5 (runtime: trace logging)
WP-B3 (runtime: evidence-pack input) ──> WP-B2 (Level-1 needs pack IDs)
WP-B2 ──> WP-B4 (runtime: minority report)   [block precondition feeds dissent]
WP-B7 (runtime: roster default, config-only) ── independent of B1..B6
WP-B8 (docs: council.md) ── after B-series code lands
```

Contract (WP-B1) blocks every structured consumer (B2, B5, B6). Evidence-pack plumbing (WP-B3) blocks the Level-1 source-ID half of WP-B2. The roster change (WP-B7) is config-only and parallelizable.

## Work-package table

| WP | Taxonomy | Title | Depends on | Gate(s) |
|---|---|---|---|---|
| WP-A1 | runtime | Remove Bearer from curl argv | — | `gate_no_bearer`, `gate_regression` |
| WP-B1 | contract | Zod claim/response schemas + text fallback | — | `gate_schema_fallback`, `gate_zod_bundled` |
| WP-B2 | runtime | Provenance-label + Level-1 source-ID block precondition | WP-B1, WP-B3 | `gate_planted_claim`, `gate_regression` |
| WP-B3 | runtime | Evidence-pack input plumbing | — | `gate_regression` |
| WP-B4 | runtime | Minority report first-class artifact | WP-B2 | `gate_minority_report`, `gate_regression` |
| WP-B5 | runtime | Structured trace logging | WP-B1 | `gate_regression` |
| WP-B6 | evaluator | Observational issue-map artifact (non-controlling) | WP-B1 | `gate_issue_map_observational`, `gate_regression` |
| WP-B7 | runtime | Odd-roster default (config-only) | — | `gate_regression` |
| WP-B8 | docs | Update `docs/council.md` (plain doc) | B-series | `gate_mdoc_clean` |

## Detailed work packages

### WP-A1 — Remove Bearer from curl argv `[runtime]`
**Touchpoints:** `fetchTextWithTimeout` (L915), `Bun.spawn(["curl", ...args])` (L945); callers `askOpenRouter` (Bearer L746), `askDirectChatProvider` (Bearer L837); preserve `resolveOpenRouterTimeoutMs` (L999).
**Change:** pass auth out of argv — `curl -K -` reading a config string `header = "Authorization: Bearer …"` from **stdin**, or a `0600` temp file unlinked immediately post-spawn. Preserve timeout semantics.
**Root-cause option (preferred if it reproduces clean):** the curl shell-out exists only to dodge a Bun `fetch()` hang diagnosed 2026-05-28 (comment near L911). Feature-detect: if the hang no longer reproduces, drop the curl path entirely and use `fetch()`. Record the probe result in the work unit; do not silently keep curl if `fetch()` is viable.
**Evidence:** unit test asserts the spawned argv (captured via a `Bun.spawn` shim/spy) contains no `Bearer`; existing OpenRouter timeout tests (`modelCouncil.test.ts` L156 / L183) stay green; manual `ps`/`/proc` argv inspection note in the WU.

### WP-B1 — Zod schemas + text fallback `[contract]`
**New file:** `src/core/services/council/schemas.ts`.
**Schemas:** `Claim{id, text, provenance: repo_fact|source_claim|assumption, evidence: string[], severity?}`, `IndependentProposal`, `DeliberationResponse`, `RatificationVote`.
**Wiring:** request JSON mode where the provider supports it; on Zod parse failure fall back to the existing text parsers — `parseRatificationVote` (L1322), `parseCandidateConsensus` (L1371), `parseConsensusSignal` (L1398/L1402) — and log a per-run parse-fail rate. All reachable only under `AGENTS_COUNCIL_STRUCTURED`.
**Evidence:** unit tests — (a) valid structured payload parses to the typed object; (b) malformed payload falls through to the text parser and increments the parse-fail counter; (c) flag-off path never touches the schema module. Plus `gate_zod_bundled` (below).

### WP-B2 — Provenance-label + Level-1 source-ID precondition `[runtime]`
**Touchpoints:** in front of `parseRatificationVote` (L1322) and the ratification precondition path; reuse existing `BLOCK_KIND`; keep `FACTUAL_ERROR` absolute (INV-4).
**Change (best-effort in Wave B, heuristic until parse-rate is validated):**
- an unlabeled factual claim → block precondition;
- an `assumption` with no stated `cheapest_verification` → block precondition;
- **Level-1 deterministic source-ID check** (Addendum A.3.3): a `repo_fact` claim whose cited evidence-pack ID is **not** present in the supplied pack → block precondition. Pure code, no LLM, no sandbox.
**Evidence:** planted-false-claim test — inject an unlabeled false repo claim and a `repo_fact` citing a non-existent pack ID; assert both are flagged/blocked. Existing ratification tests stay green. (Level-2 tool/LLM execution verifier is **Wave C**, not here.)

### WP-B3 — Evidence-pack input plumbing `[runtime]`
**Touchpoints:** optional `evidencePack: {id, text, source}[]` arg on `runModelCouncil` (L276); prepend to proposal system messages in `buildProposalMessages` (L1164).
**Scope boundary:** plumbing only — pack **generation** is out of scope. `repo_fact` claims are *expected* to cite a pack ID (enforced by WP-B2's Level-1 check).
**Evidence:** unit test — a supplied pack appears in the round-0 system message; omitting the pack leaves prompts byte-identical to legacy.

### WP-B4 — Minority report as first-class artifact `[runtime]`
**Touchpoints:** extend `ConsensusResult` / `buildConsensusResult` (L1595) and `formatModelCouncilMarkdown` (L469) with `minorityReport[]`. Emit on `blocked` (and, later, on the nested `qualified_consensus` path). CLI exits non-zero on `blocked`.
**Enum guard (INV-6):** do **not** add `qualified_consensus` to the top-level enum; minority reports key off `blocked` now.
**Evidence:** one absolute veto preserves dissent in **both** JSON and Markdown; CLI exit code is non-zero on `blocked`.

### WP-B5 — Structured trace logging (no learner) `[runtime]`
**Touchpoints:** persist per-claim / per-member / per-round structured traces + outcome alongside the existing `council-{ts}.json/.md` in `saveModelCouncilRun` (L561). Equal member weights; **never** weight by prestige. Consumer contract = `deliberations/*.json` (already consumed by external `~/.claude/halo_x_tools/council_to_brief.py`).
**Evidence:** a run with the flag on writes a trace file whose schema matches the documented contract; a downstream `council_to_brief.py` parse smoke (or a fixture asserting the field shape) succeeds.

### WP-B6 — Observational issue-map artifact (non-controlling) `[evaluator]`
**Decision (Addendum A.5 — has a cut-line):** parse schema-validated claims into a deterministic (normalized exact-match) agreed/contested issue map and **persist** it as `issue-map-{ts}.json` next to `council-{ts}.json/.md` in `saveModelCouncilRun` (L561). It **controls nothing** — INV-3 holds; F3 self-report stays the live controller. This artifact is the **instrument** that produces the Wave-C entry-gate evidence (misclustering rate, false-consensus cases) that schema-parse-rate alone cannot measure and that falsifier F2 asks about directly.
**Cut-line (user may veto to keep Wave B lean):** drop issue-map *construction* and log only the raw schema-validated per-member claims; the Wave-C gate then rests on parse-rate + manual inspection. **Default = build the audit-only issue map** (~80–150 LOC exact-match clustering; confidence moderate-high it is worth it).
**Evidence:** `gate_issue_map_observational` — a fixture with known agreed/contested claims yields the expected partition; a test asserts the map is **never** read by `isConverged`/ratification (controller-isolation assertion).

### WP-B7 — Odd-roster default (config-only) `[runtime]`
**Touchpoints:** `buildDefaultMembers` (L633) + `selectConfiguredMembers` (L673); `AGENTS_COUNCIL_MEMBERS`. Default to odd n ≥ 3 heterogeneous for decision tasks; keep n = 2 for cheap drafts. **No protocol code change.**
**Evidence:** default config resolves to an odd ≥3 heterogeneous roster; explicit `AGENTS_COUNCIL_MEMBERS=2` still yields n=2. Regression suite green.

### WP-B8 — Docs update `[docs]`
Update `docs/council.md` to document the structured path, `AGENTS_COUNCIL_STRUCTURED`, the provenance-label/Level-1 precondition, the minority-report artifact, the observational issue map, the new env vars, and the enum-freeze decision. Cross-link the Wave-C gate. (This plan declares the target; it does not author the doc body. Plain doc edit — agents-council has no MDOC registry/scope-signature tracking.)

## Gate definitions (all `planned`)

| Gate | State | Asserts |
|---|---|---|
| `gate_no_bearer` | planned | No spawned child argv contains `Bearer` (unit test over the `Bun.spawn` shim). |
| `gate_zod_bundled` | planned | Zod is bundled into the compiled `dist/council` (`bun build --compile`) OR promoted to `dependencies`; verified by building and exercising a schema parse from the compiled binary, **not** assumed from the devDeps listing. |
| `gate_schema_fallback` | planned | Malformed structured payload falls back to the text parser and increments the parse-fail counter; flag-off path never imports the schema module. |
| `gate_planted_claim` | planned | Planted unlabeled false claim and planted `repo_fact` with a non-existent pack ID are both flagged/blocked (best-effort). |
| `gate_minority_report` | planned | `blocked` run emits `minorityReport[]` in JSON and Markdown; CLI exit non-zero. |
| `gate_issue_map_observational` | planned | Issue map partitions a known fixture correctly AND is never consulted by the convergence/ratification controller (INV-3). |
| `gate_regression` | planned | `modelCouncil.test.ts` green; `bun run typecheck` clean; `bun run format:check` clean. Legacy-default behavior (flag off) unchanged. |
| `gate_mdoc_clean` | planned | `docs/council.md` updated to document the structured subsystem (plain doc; no MDOC registry in this repo, so no scope-signature check). |

**`gate_order`** (acceptance order): `gate_no_bearer` → `gate_zod_bundled` → `gate_schema_fallback` → `gate_planted_claim` → `gate_minority_report` → `gate_issue_map_observational` → `gate_regression` → `gate_mdoc_clean`.

`gate_regression` is re-evaluated as the penultimate gate over the whole integrated build (it is also listed per-WP so each WU self-checks).

## Rollout sequencing

**`workstream_order`** (taxonomy order): `contract` → `runtime` → `evaluator` → `docs`.
(No `seeded-data`, `performance-measurement`, `performance-runtime`, or `native` categories — justified in §Category omissions.)

**Critical path:** WP-A1 (ships alone) ‖ WP-B1 → {WP-B3 → WP-B2 → WP-B4} ‖ WP-B5 ‖ WP-B6 ‖ WP-B7 → WP-B8.

**Wave boundaries:** WP-A1 is releasable independently (security). The Wave B series ships as a unit behind `AGENTS_COUNCIL_STRUCTURED` (default off) so the legacy path remains authoritative until the Wave-C entry gate measures parse-fail < 5%.

## Coverage matrix

| Brief / Addendum item | Disposition | WP |
|---|---|---|
| P0-1 bearer | BUILD (Wave A) | WP-A1 |
| P0-3 retry parity | DROP (shipped) | — |
| P0-4 Zod schemas + fallback | BUILD | WP-B1 |
| P0-2 label gate | BUILD (best-effort) | WP-B2 |
| A.3.3 Level-1 source-ID check | BUILD (into B2, early) | WP-B2 |
| A.3.3 Level-2 tool verifier | DEFER (Wave C) | — |
| P1-1 evidence pack | BUILD (plumbing) | WP-B3 |
| P1-3 demote Jaccard | DROP (shipped, F3) | — |
| P1-6 minority report | BUILD | WP-B4 |
| C4 enum freeze | BUILD (INV-6) | WP-B4 |
| P2-1 roster default | BUILD (config-only) | WP-B7 |
| P2-2 trace logging | BUILD | WP-B5 |
| A.5 observational issue map | BUILD (non-controlling) | WP-B6 |
| P1-2 issue-map controller / dispute packets | DEFER (Wave C) | — |
| P1-3' claim-ledger convergence | DEFER (Wave C) | — |
| P1-5 source-check verifier | DEFER (Wave C) | — |
| P1-4 task-type router | DEFER (Wave C) | — |
| A.3.2 broad benchmark suite | DEFER (Wave-C entry-gate eval) | — |

## First milestone (de-risking)

**WP-A1 + WP-B1.** WP-A1 is a self-contained security fix with an unambiguous pass criterion (no `Bearer` in argv) and an existing timeout-test regression surface. WP-B1 establishes the contract every other Wave B consumer depends on and surfaces the highest-uncertainty fact early — whether Zod survives `bun build --compile` from `devDependencies` (`gate_zod_bundled`). Both are fully scoped with no unresolved interpretation.

## Deferred work — Wave C (DEFERRED, hard-gated; recorded, NOT authored as buildable)

**Membership:** P1-2 deterministic issue map *as live controller* + targeted dispute packets (exact-match clustering; embeddings deferred — no embedding lib present); P1-3' claim-ledger convergence (replace the F3 self-report arm with "zero open high-severity contested claims"); P1-5 Level-2 source-check verifier (`mcp__verify__` prefix, read-only, allowlisted); P1-4 task-type router.

**Entry gate (both required):**
- (a) structured-output parse-fail rate **< 5%** over ≥ 50 sample runs (measured by Wave B's parse-fail counter); **and**
- (b) structured council **beats self-consistency** (and a single strong model) on the benchmark task distribution — measured as the **union** of the repo-specific Wave B regression gates (planted-claim, parse-fail, no-Bearer) **and** the external-validity portfolio (MMLU, GSM8K, GPQA, HotpotQA, FEVER, StrategyQA, MuSR, TruthfulQA + calibration), framed against **decision quality per token under bounded latency** (Addendum A.3.1), not agreement/convergence speed.

**Fail either gate →** downgrade the issue map to audit-only, keep F3 self-report convergence + the P0-2 label gate, and **stop**. This is the proposal's own kill-switch.

**Note:** the Wave C benchmark campaign is the project's performance-relevant surface (multi-benchmark eval). It is out of the authored build scope; if/when it is built it must be planned as its own performance-critical campaign with budgets and equivalence checks. The authored Wave A+B build is **not** performance-critical (see §Performance classification).

## Performance classification (justification for no performance-architecture section)

`perf_critical: false`. The authored Wave A+B scope is provenance/schema/security plumbing confined to `modelCouncil.ts` (1667L) + a new `schemas.ts` + a ~1007L test surface. There is **no** trigger: no >50k rows/artifacts, no wall-clock/throughput/GPU budget, no model inference at scale, no batch/wave campaign, no native/Rust/CUDA. `perf_budget: []`. `native_acceleration.enabled: false`. The deferred Wave C benchmark eval *is* perf-relevant but is explicitly out of build scope and recorded as a separately-plannable campaign.

## Category omissions (justified)

- **seeded-data:** the evidence pack is operator-supplied input plumbing (WP-B3), not literature/report/calibration-seeded values consumed for behavior; no init-profile provenance package is warranted.
- **performance-measurement / performance-runtime / native:** see §Performance classification — no perf-critical work in scope.

## Falsifiers (carry into acceptance)

- **F1 (HIGH):** structured council does not beat self-consistency on the target distribution → deprecate the deliberation apparatus for that task class. This is the Wave-C entry gate (b); it gates Wave C, not the Wave A+B ship.
- **F2 (MED-HIGH):** the mandated ablation shows no issue-map correctness/auditability benefit at n=2 → Wave C not justified; issue map stays audit-only. The Wave B observational issue map (WP-B6) is the instrument that produces this ablation's evidence.

## Documentation targets

- `docs/council.md` — the council subsystem doc (plain Markdown; **not** MDOC-tracked — agents-council has no MDOC registry). Materially changed: structured path, `AGENTS_COUNCIL_STRUCTURED`, provenance-label/Level-1 precondition, minority-report artifact, observational issue map, new env vars, enum-freeze decision, Wave-C gate cross-link. (Plan declares the target; downstream authors the body.) `mdoc_targets` is `[]` in the handoff so the decomposer's Phase 6.5 does not attempt MDOC stub materialization on this nested repo.

## Terminal review parameters

Post-acceptance `hydra_review` audit:
- **target:** the worktree repo root `agents-council-worktrees/council-claim-ledger`.
- **components:** `src/core/services/modelCouncil.ts`, `src/core/services/council/schemas.ts`, `src/core/services/council/` (changed siblings), `src/core/services/modelCouncil.test.ts`.
- **focus:** credential-leak elimination (INV-1), structured-path additivity/flag-gating (INV-2), controller-isolation of the issue map (INV-3, INV-5), no-dictator/typed-veto preservation (INV-4), enum freeze (INV-6), no parallel fork (INV-7).
- **budget:** medium (single-file engine + new schema module + test surface; ~9 WPs).
- **impact_radius:** `src/core/services/` and the `deliberations/*.json` consumer contract.

## Grounding verification (hand-verified @ `fbfc9e8`, codegraph empty)

- Bearer at L746 (`askOpenRouter`) and L837 (`askDirectChatProvider`); `Bun.spawn(["curl", ...args])` at L945. ✓
- `OPENROUTER_MAX_ATTEMPTS=3` (L730); identical retry loops at L759 and L845 → P0-3 parity confirmed, dropped. ✓
- F3 live: comments L97–99 state Jaccard is telemetry-only and `isConverged` keys on self-reported `CONSENSUS_STATUS` with draft-overlap fallback. ✓
- `zod@4.2.1` in **devDependencies**; `build` = `bun build src/cli/index.ts --compile --outfile dist/council` → `gate_zod_bundled` required. ✓
- `src/core/services/council/` contains `index.ts`, `index.test.ts`, `summon.ts`, `types.ts`, `objectiveConsensusPrompt.ts` — **no** `schemas.ts` (new file confirmed). ✓
- `modelCouncil.ts` 1667L; `modelCouncil.test.ts` 1007L. ✓

## Planning assumptions and open questions

1. **[assumption]** Bun `--compile` bundles all reachable imports regardless of the deps/devDeps split, so Zod's devDep status is likely fine — but `gate_zod_bundled` verifies this from the compiled binary rather than assuming it. (confidence: moderate)
2. **[open]** Whether the 2026-05-28 Bun `fetch()` hang still reproduces. If not, WP-A1 may delete the curl shell-out entirely; if so, WP-A1 uses `curl -K -`/stdin. The WU records the probe result. (confidence: unknown — decided at WU time)
3. **[open / cut-line]** WP-B6 issue-map *construction* vs raw-claims-only logging. Default = build it (it is the Wave-C gate instrument). User may veto to keep Wave B lean. (confidence: moderate-high that construction is worth ~80–150 LOC)
4. **[assumption]** JSON mode is available on the OpenRouter/direct providers in use; where unavailable, WP-B1's text fallback covers it and the parse-fail counter records the gap. (confidence: moderate)
5. **[schema-pressure note]** The handoff `acceptance_checklist` is `default` because the authored scope is not perf-critical; the deferred Wave C benchmark campaign would need a `perf-budget-ml` checklist when separately planned. Recorded rather than smuggled into this plan.

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
mdoc_targets: []  # agents-council (nested repo) has no MDOC registry; docs/council.md is updated as a plain doc by WP-B8. MDOC is an o4-project-level system and does not reach into this repo. See implementation-notes.html 2026-06-08 OFF-SPEC.
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
native_acceleration:
  enabled: false
next_recommended_command: /implementation-work-units docs/implementation/council-claim-ledger-delphi/implementation-plan.md
```

# WU-B3 — Evidence-pack input plumbing — execution report

- **unit:** WU-B3
- **taxonomy_category:** runtime
- **state:** done @ 2026-06-08
- **gate(s):** `gate_regression` (contributes; gate stays `planned` until acceptance)
- **invariants verified:** INV-2, INV-8

## Change summary

Added an optional `evidencePack` argument that the caller can pass to
`runModelCouncil`; round-0 proposal system messages prepend the supplied pack so
members can cite entries by `[id]`. Plumbing only — pack generation and the
Level-1 source-ID check are out of scope (WU-B2 consumes the ids).

## Files changed (`src/core/services/modelCouncil.ts`)

| Range | Change |
|---|---|
| ~L188–200 | New `EvidencePackEntry = {id, text, source}` type; `RunModelCouncilInput` gains optional `evidencePack?: EvidencePackEntry[]`. |
| ~L285 | `runModelCouncil` passes `input.evidencePack` into `buildProposalMessages` for the round-0 independent proposals. |
| ~L1190–1240 | `buildProposalMessages(prompt, member, evidencePack?)` — when the pack is non-empty it is prepended ahead of the legacy directive; when absent/empty the system message is byte-identical to legacy. New private `formatEvidencePack` renders `- [id] (source) text` lines under a citable header. |

New test file: `src/core/services/modelCouncil.evidencePack.test.ts`.

## Tests

- **New tests** (`modelCouncil.evidencePack.test.ts`, 2 pass / 14 expect):
  - `WU-B3 evidence-pack proposal plumbing > supplied pack prepends its entries to the round-0 proposal system message` — asserts each entry appears keyed by `[id]` with source+text, that the pack is prepended (not appended) ahead of the legacy directive, and the user message is unchanged.
  - `WU-B3 evidence-pack proposal plumbing > omitting the pack yields byte-identical legacy proposal messages` — asserts no-arg === explicit empty-pack, the legacy system message starts with the member-identity line, and carries no evidence-pack scaffolding (INV-2).
- **Regression:** `modelCouncil.test.ts` 52 pass / 0 fail. Combined run 54 pass / 0 fail.
- **typecheck:** clean (`tsc --noEmit`).
- **format:check:** my two files are format-clean (auto-formatted via biome). Remaining red is the pre-existing baseline `harness/run_tier5_scheduling_council.ts`, byte-identical to HEAD and unrelated to this work.

## Invariant evidence

- **INV-2** (legacy default byte-identical): the no-pack and empty-pack paths produce identical bytes; only a non-empty pack mutates the system message. Pinned by the byte-identity test. Note: B3's gate is `gate_regression` only; the spec scopes B3's INV-2 obligation to "prompt bytes when no pack is supplied stay byte-identical to legacy" — it does **not** require the evidence-pack injection itself to sit behind `AGENTS_COUNCIL_STRUCTURED` (that flag gates the structured contract in WU-B1/B2, not this optional arg). Pack-absence = legacy is the satisfied condition.
- **INV-8** (regression green / typecheck / format clean): verified above.
- **INV-7** (additive, no fork): the change is an optional parameter threaded through the existing `runModelCouncil` → `buildProposalMessages` path; no parallel council flow added.

## Downstream

WU-B3 done unblocks WU-B2 (which depended on WU-B1 done + WU-B3 done). WU-B2 → `ready`.

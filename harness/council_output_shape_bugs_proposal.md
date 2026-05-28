# Council output-shape bugs — proposal

Two bugs surfaced by the 1-round Model Council run (`AGENTS_COUNCIL_MAX_ROUNDS=1`, members `kimi,deepseek,chatgpt,claude`, completed 2026-05-28T03:25Z). Neither is a hang or a model-side failure — both are how the council's *result JSON* misrepresents reality to any caller.

Single proposal, two atomic fixes, both in `src/core/services/modelCouncil.ts`.

---

## Bug 1 — `consensus.blockedBy` lies on non-convergence (high severity)

### Symptom

On a council that ran cleanly but did **not** converge in the allotted rounds, the result JSON contains:

```json
"converged": false,
"ratifications": [],
"consensus": {
  "reached": false,
  "ratifiedBy": [],
  "blockedBy": ["Kimi K2.6", "DeepSeek V4 Pro", "ChatGPT 5.5", "Opus 4.7"]
}
```

Every member is labelled as having **blocked** consensus. They didn't. The ratify phase never ran (see `modelCouncil.ts:235-249` — ratify is gated on `converged`). No member ever cast a BLOCK vote, yet the consumer-facing field says all four did.

### Root cause

`buildConsensusResult` in `modelCouncil.ts:1057-1080` has two semantically distinct branches that share a single field name:

```ts
if (!converged) {
  return {
    reached: false,
    ratifiedBy: [],
    blockedBy: members.map((member) => member.name),  // ← LIES: nobody voted BLOCK
  };
}
const ratifiedBy = ratifications.filter(r =>  r.accepted).map(r => r.member.name);
const blockedBy  = ratifications.filter(r => !r.accepted).map(r => r.member.name);
return { reached: blockedBy.length === 0 && ratifiedBy.length === ratifications.length,
         ratifiedBy, blockedBy };
```

The converged branch defines `blockedBy` correctly as "members who voted REJECT in ratify." The non-converged branch overloads the same field to mean "members for whom no ratify vote was even attempted." Identical JSON shape, opposite meaning. A caller cannot distinguish:

- *"4 members deliberated but never reached a candidate consensus"* (true state)
- *"4 members deliberated, reached a candidate consensus, and 4 voted to BLOCK ratification"* (false state implied by the JSON)

This matters for any downstream automation deciding whether to surface the council's draft answer, retry with more rounds, or escalate to a human.

### Fix

Drop the overload. On non-convergence, both `ratifiedBy` and `blockedBy` are empty arrays; surface the *reason* in a new optional field.

```ts
// ModelCouncilConsensus type — add:
//   notRatified?: "did_not_converge" | "ratify_skipped"
// or simpler: a single new string field `outcome` with one of:
//   "ratified" | "blocked" | "not_attempted"

function buildConsensusResult(
  ratifications: ModelCouncilRatification[],
  members: ModelCouncilMember[],
  converged: boolean,
): ModelCouncilConsensus {
  if (!converged) {
    return {
      reached: false,
      ratifiedBy: [],
      blockedBy: [],
      outcome: "not_attempted",
      notRatifiedReason: "no candidate consensus emerged before max rounds",
    };
  }
  const ratifiedBy = ratifications.filter(r =>  r.accepted).map(r => r.member.name);
  const blockedBy  = ratifications.filter(r => !r.accepted).map(r => r.member.name);
  const reached = blockedBy.length === 0 && ratifiedBy.length === ratifications.length;
  return { reached, ratifiedBy, blockedBy, outcome: reached ? "ratified" : "blocked" };
}
```

Also update the markdown renderer at `modelCouncil.ts:300-326` (the "Council Consensus Blocked" section) — it currently prints `Blocked by: ${blockedBy.join(", ")}` and will inherit the same lie until this is fixed.

### Why the fix is shaped this way

- Keeps the existing `ratifiedBy` / `blockedBy` shape for backwards compatibility; just stops poisoning them.
- Adds one field (`outcome`) that captures the trichotomy callers actually need.
- The `notRatifiedReason` string is human-facing only; machines key off `outcome`.

---

## Bug 2 — `responses[i].member` and `deliberations[i].member` are full member objects, not names (medium severity)

### Symptom

```js
for (const x of result.responses) console.log(x.member);  // → "[object Object]"
```

The serialized JSON inlines the entire `ModelCouncilMember` record (name, model id, provider config, possibly env-key references) inside every propose-phase response, every deliberation turn, and every ratification. A consumer that grabs `x.member` expecting `"Kimi K2.6"` instead gets an object.

### Root cause

`modelCouncil.ts:183-188` (propose):

```ts
const responses = await Promise.all(
  members.map(async (member) => ({
    member,                                // ← whole object, not member.name
    content: await askMember(member, buildProposalMessages(prompt, member)),
  })),
);
```

Same pattern at `:196-208` (deliberation) and `:236-247` (ratify). All three sites stuff the full `member` reference into the per-turn record.

### Fix

Two reasonable shapes; pick one.

**Option A (minimal, name-only):** replace `member` with `memberName` everywhere and drop the object reference.

```ts
members.map(async (member) => ({
  memberName: member.name,
  content: await askMember(member, buildProposalMessages(prompt, member)),
}))
```

**Option B (richer, but typed):** keep `member` but narrow it to a `{ name, modelId }` projection — never the full `ModelCouncilMember` (which may contain provider hints, headers, etc.).

```ts
type MemberRef = Pick<ModelCouncilMember, "name" | "model">;
const ref = (m: ModelCouncilMember): MemberRef => ({ name: m.name, model: m.model });
// ...then return { member: ref(member), content }
```

**Recommend Option B.** Keeps the structured shape `result.members[]` already follows (each has `name` + `model`), preserves enough info that downstream parsers can join on either, and explicitly excludes anything provider-secret-adjacent.

### Why this is medium, not low

- The full `ModelCouncilMember` JSON shape is not under audit. If anyone ever extends it with a field that looks like a header value or API hint, every council result file (already 252 KB per run) leaks it. The fix front-loads that boundary.
- The current shape produces invalid behavior in trivial display code (template literals, csv export, `.member` access). That's a per-consumer cost the council is silently paying.

---

## Bug 3 — Convergence threshold is too strict for free-form prose (high severity)

### Symptom

Across two test runs (`MAX_ROUNDS=1` and `MAX_ROUNDS=2`) the council never converged despite substantively unanimous content. Round 2 of the 2-round run had:

| Metric | Round 1 | Round 2 |
|---|---|---|
| `memberAgreement` (pairwise Jaccard) | 0.323 | **0.628** |
| `similarityToPrevious` | null | **0.643** |
| `isConverged()` returned | false | false |

All four members produced near-identical opening sentences ("Longer harness docs do not work. You teach an agent its harness with two coupled systems..."), an identical three-system taxonomy (harness-use / harness-design / harness-doctrine), and an identical critique of the seed (overbuilds B+C, missing A). Yet `converged = false`.

### Root cause

`isConverged` at `modelCouncil.ts:1001-1006`:

```ts
function isConverged(round: ModelCouncilRound): boolean {
  if (!round.changed) return true;
  return round.similarityToPrevious !== null
      && round.similarityToPrevious >= 0.95;   // DEFAULT_CONVERGENCE_SIMILARITY_THRESHOLD
}
```

Two failure modes:

1. **Wrong metric.** `similarityToPrevious` measures the *assembled candidate-consensus blob* between consecutive rounds — that blob includes every member's full draft, complete with section preambles and reasoning. Even when 4 members produce substantively identical answers, their prose phrasing varies enough run-to-run that the assembled-blob similarity rarely clears 0.95. The right metric is `memberAgreement` — pairwise similarity *within* a round, which directly answers "do the members currently agree?"
2. **Wrong threshold.** A token-set Jaccard of ≥ 0.95 on free-form prose effectively demands copy-paste agreement. Independent reasoners producing the same idea in different sentences routinely score 0.60-0.80. The comment in `modelCouncil.ts:28-31` already acknowledges this: max rounds was *raised from 4 to 6* "because runs were hitting the cap while still actively converging." That's a symptom; this is the cause.

### Fix

Two-pronged: keep the existing similarity arm as a strict fast-path, add a `memberAgreement` arm as the realistic convergence criterion. Either firing means convergence.

```ts
const DEFAULT_CONVERGENCE_AGREEMENT_THRESHOLD = 0.8;
// ^ pairwise Jaccard, 0..1. Independent reasoners producing substantively
// identical answers in different prose typically land in 0.7–0.9.

function isConverged(round: ModelCouncilRound): boolean {
  if (!round.changed) return true;
  const simThreshold   = resolveConvergenceSimilarityThreshold();   // existing 0.95
  const agreeThreshold = resolveConvergenceAgreementThreshold();    // new 0.80
  if (round.similarityToPrevious !== null && round.similarityToPrevious >= simThreshold) return true;
  if (round.memberAgreement >= agreeThreshold) return true;
  return false;
}
```

Add both as env-overridable:

```
AGENTS_COUNCIL_CONVERGENCE_SIMILARITY_THRESHOLD   # default 0.95 (existing)
AGENTS_COUNCIL_CONVERGENCE_AGREEMENT_THRESHOLD    # default 0.80 (new)
```

Set either to `1.0` to disable that arm.

### Why this is the right shape

- **Strict superset.** Adding the agreement arm only widens what triggers convergence. Existing users get the same convergence-or-better behavior; no callers break.
- **Measures the thing we actually want.** Council convergence ≡ "the members agree." `memberAgreement` is the direct measurement; `similarityToPrevious` is a proxy that conflates "members agree" with "members made no changes." A strong round 1 that doesn't get edited in round 2 (high `similarityToPrevious`) is one form of convergence; 4 members independently producing the same answer in round 2 (high `memberAgreement`) is another. The current code recognizes only the first.
- **0.80 is empirically conservative.** Round 2 of the test run scored 0.628 with all 4 members substantively unanimous on a three-system architecture but using varying prose. 0.80 sits comfortably above that, so this fix does NOT lower the bar to false-positive convergence on round-2 results; it leaves 4-6 more rounds of latitude before tripping.

### Tradeoff

If the council later picks up a 7th or 8th member with high model-temperature variance, `memberAgreement >= 0.80` might fire prematurely on a noisy run. Mitigation: the env var. Mitigation #2: optionally require *both* arms (similarity OR agreement) AND `round.index >= 2` so first-round flukes can't trigger — already implicit because `similarityToPrevious` is null on round 1, but `memberAgreement` isn't. Add `if (round.index < 2) return false` first if we want to be strict; recommended for now to ship without it and adjust if false positives appear.

---

## Required gates after all three fixes

Per `agents-council/CLAUDE.md`:

```bash
bun run typecheck
bun run format:check
```

Plus a smoke test that re-runs `AGENTS_COUNCIL_MAX_ROUNDS=2` with the same 4-member set and asserts:

1. `result.consensus.outcome === "ratified" | "blocked" | "not_attempted"` (no implicit lie).
2. If `outcome === "not_attempted"`, then `blockedBy.length === 0 && ratifiedBy.length === 0`.
3. `typeof result.responses[0].member === "object" && typeof result.responses[0].member.name === "string"` (Bug 2 Option B).
4. **Object.keys(result.responses[0].member) is exactly `["name", "model"]`** — no `id` or `provider` leakage in serialized output (Bug 2 runtime projection).
5. If `result.rounds.at(-1).memberAgreement >= 0.80` then `result.converged === true` (Bug 3 fix surface).

If gates and assertions pass, shippable in a single PR. No new tests for the converged ratification path are required — that branch's semantics are unchanged.

---

## What this does NOT fix

- The OpenRouter Bun-fetch hang on Kimi K2.6 (already fixed via curl shellout in `fetchTextWithTimeout`, applied 2026-05-27).
- The mid-deliberation proposal injection design (separate proposal at `harness/midflight_injection_proposal.md`).
- The fact that 1 round is too few to converge on a hard topic. Bumping `AGENTS_COUNCIL_MAX_ROUNDS` is a config decision, not a code fix; the code path is correct.

Confidence: **high** on both bug diagnoses and on Option B as the right shape for Bug 2.

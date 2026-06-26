# PLAN_INPUT_BRIEF — arxiviq-trained: a corpus-fitted, autonomous paper-review skill

## Goal (one line)

Turn the hand-authored `arxiviq-review` skill into a **corpus-fitted, autonomous**
review generator: given a paper URL it ingests, retrieves real exemplars from the
399-review corpus, drafts, self-critiques to a corpus-derived rubric, and emits a
finished HTML review whose style/structure/length land inside the corpus
distribution — with no human as the final eye.

## Problem / context (grounded)

- The corpus: **399 reviews** under
  `agents-council/harness/arxiviq_subscription_download/html_static_named/`,
  numbered/named `NNN-slug.static.html`. **392/399 carry a recoverable arXiv id**
  (`arxiv.org/abs/NNNN.NNNNN`), so (paper → review) pairs are reconstructible for 98%.
- Measured visible-word distribution of the 399: **median 1,439**, p25 1,323,
  p75 1,574, min 580, max 2,240.
- The current skill is **provably not fitted**: `voice.md`/`SKILL.md` instruct
  "2,000–3,000 words, floor 1,500" — ~40% longer than the real median, and
  visible-word counts *over*count prose. The thresholds were hand-estimated,
  not mined. The skill conditions generation on an *abstraction* (`voice.md`),
  has **no retrieval index** of the 399, and **no critic loop**.
- `arxiviq_review_generation_approach.md` already lists "exemplar retrieval" as
  step 1 — specced, never built. This builds it.
- "Trained" here means a **corpus-fitted prompt program**, not weight training.
  Opus 4.8 is not fine-tunable by the user; the skill's parameters (style targets,
  exemplar set, rubric thresholds) are the trainable surface, fit to the 399 and
  validated against held-out members of it.

## Authoritative sources of truth

- Corpus: `agents-council/harness/arxiviq_subscription_download/html_static_named/*.static.html` (READ-ONLY).
- Existing skill (to be rewired, not discarded): `~/.claude/skills/arxiviq-review/`
  (`SKILL.md`, `voice.md`, `template.html`, `build.py`). `build.py` (deterministic
  JSON→HTML renderer) is reused unchanged.
- Build home: `agents-council/harness/arxiviq_trained/` (gitignored subtree, like the corpus).

## Recommended path

In-session autonomous generation (engine = Opus 4.8 in Claude Code; "use you"),
with retrieval + critic loop replacing the human reviewer. Held-out eval runs
in-session, sequential, over ~12 papers (no API key / batch spend). A batch-20
Anthropic-API blind eval (`claude-opus-4-8`) is a flagged upgrade, not in scope now.

## Scope

IN: corpus miner → measured style-card; paper↔review pairing + extraction;
retrieval index over the 392 pairs; an autonomous generation driver that
orchestrates ingest→retrieve→draft→critic→render; a critic/revise module;
a held-out acceptance-eval harness; rewiring the skill files to consume the
style-card + retrieval + critic steps (fixing the length miscalibration).

OUT: weight fine-tuning of any model; modifying the 399 corpus files; the
batch-20 API eval; multi-model council judging (flagged as optional upgrade);
the hero-comic SVG/prompt spec (unchanged — `build.py`/`voice.md` already cover it).

## Invariants & constraints (HARD — bake into every work unit)

1. **Corpus is read-only training data.** Never edit/move/rewrite the 399 files
   in place (CLAUDE.md rule #3 spirit). All mining reads; writes go to `arxiviq_trained/`.
2. **No fabricated numbers or citations** (existing skill guardrail carries forward).
3. **Length target = measured corpus IQR** (≈1,320–1,575 visible words), NOT the
   legacy 2,000–3,000. The miner produces the number; the skill consumes it.
4. **No model-param changes without asking** (CLAUDE.md rule #1). Default engine
   `claude-opus-4-8`; do not alter temperature/limits.
5. **No retrieval leakage**: a held-out paper is excluded from its own exemplar set.
6. **Deterministic render unchanged**: reuse `build.py` as-is; the model still
   writes the payload JSON.

## Work-unit seeds (architect to refine; dependency order)

1. **WU-MINE** — corpus miner → `style-card.json` + human-readable `style-card.md`:
   length IQR, section-count dist, section-title patterns + lexicon, TL;DR
   structure, citation density, hero-style taxonomy, TF-IDF characteristic-phrase
   lexicon, banned-flattery lexicon. Verify: numbers reproduce the measured median 1,439.
2. **WU-PAIR** — parse arXiv id + extract per-review structure → `pairs.jsonl`
   (arxiv_id, slug, review_text, section_skeleton). Verify: ≥390 pairs, ids well-formed.
3. **WU-INDEX** — retrieval index over the 392 pairs (embedder: sentence-transformers
   if present in `/home/dstefanescu/myenv`, else TF-IDF cosine fallback). API:
   `retrieve(paper_text, k) → [exemplars]`. Verify: top-k on a held-out paper returns
   same-domain neighbors on spot-check.
4. **WU-DRIVER** — autonomous orchestrator: ingest paper → structured extraction →
   retrieve k → assemble gen-context (style-card + k exemplars + extraction) →
   payload JSON → `build.py` → HTML. Verify: produces a full HTML for one sample paper.
5. **WU-CRITIC** — rubric scorer + targeted-rewrite loop (≤3 iters): structure
   conformity, length-in-IQR, mechanism precision (each core claim names a construct
   + type signature/equation), abstract-paraphrase n-gram guard, flattery-lexicon
   guard, citation realism, hero present. Verify: a deliberately-thin draft is
   measurably moved toward conformance.
6. **WU-EVAL** — held-out harness: hold out ~12 reviews; regenerate from paper using
   the other 380 as exemplars; blind pairwise judge (real vs generated) + rubric-IQR
   check. Verify: emits an acceptance report with per-pair verdicts.
7. **WU-WIRE** — rewire `~/.claude/skills/arxiviq-review/`: SKILL.md procedure gains
   retrieve+critic steps; voice.md length targets replaced by style-card numbers;
   ship the driver. Verify: invoking the skill on a fresh paper runs the full
   autonomous pipeline end-to-end.

## Acceptance criteria (overall)

- `style-card.json` mined and reproduces the corpus length median (1,439 ± small).
- `pairs.jsonl` has ≥390 well-formed (arxiv_id, review) pairs.
- Retrieval returns plausible same-domain neighbors on ≥3 spot-checked held-out papers.
- The driver autonomously emits a complete HTML review (hero present, length in IQR)
  for a sample paper with zero human intervention.
- The critic loop moves a thin draft's rubric score up by a measurable margin.
- **Held-out eval (the training signal): blind-judge accuracy ≤ ~60% (near chance)
  on ≥12 pairs, AND generated rubric scores fall within the corpus IQR.**

## Falsifiers / open design questions (resolve in plan)

- Does retrieval actually beat style-card-only on corpus-match? (A/B inside WU-EVAL —
  if it doesn't, drop the index and keep the cheaper style-card path.)
- Is the in-session model a *valid* blind judge of its own output, or self-biased?
  (Mitigate: judge in a separate context with paper+two-anonymized-reviews only;
  optional second-model council judge flagged as upgrade.)
- Can the critic reliably detect mechanism-thinness, or only length/structure?
  (Validate against held-out; if not, scope the rubric to what it can enforce and say so.)
- Embedder availability in `myenv` (sentence-transformers vs TF-IDF fallback).
- Technical-depth ceiling: the pipeline cannot exceed the engine's comprehension of
  the paper; the critic catches thinness but cannot manufacture understanding.
  State this limit; do not gate on depth the model cannot reach.

## Risks

- **Judge self-bias** inflates the eval (generated reviews look real to their own author).
  Highest-risk assumption; the blind-context + optional second-model mitigation must hold.
- **Retrieval leakage** silently passes the eval. Enforce held-out exclusion in code, test it.
- **Style overfitting**: matching the corpus's *length/section* fingerprint while
  the prose stays a dressed-up abstract paraphrase. The abstract-paraphrase guard
  in WU-CRITIC is the defense; verify it actually fires.

## To run (user-invoked path; primary-tree HALO exception — see notes)

Worktree isolation is moot here: the build target is entirely gitignored, so a
worktree is empty of the corpus. Use the sanctioned single-run-in-primary-tree
exception (`.halo-x/ALLOW_PRIMARY`), then:

```
python3 ~/.claude/halo_x_tools/start_run.py plan \
  --plan agents-council/harness/arxiviq_trained/PLAN_INPUT_BRIEF.md \
  --no-ground --note "arxiviq-trained: corpus-fitted autonomous review skill"
# then invoke the implementation-plan skill named in the banner.
```

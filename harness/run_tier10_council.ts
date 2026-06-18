#!/usr/bin/env bun
// Four-member agents-council that drafts a DETAILED IP-HOPE Tier 10
// implementation plan ("Priced Objectives and Mission Negotiation").
//
// Roster (AGENTS_COUNCIL_MEMBERS): claude, chatgpt, kimi, deepseek
//   - claude   → Opus 4.8        (local claude CLI)
//   - chatgpt  → GPT-5.5         (local codex CLI)
//   - kimi     → Kimi K2.6       (direct Moonshot API, reasoning)
//   - deepseek → DeepSeek V4 Pro (direct DeepSeek API, reasoning)
// kimi/deepseek use their DIRECT vendor APIs, not OpenRouter. AGENTS_COUNCIL_DIRECT_VENDOR_KEYS=1
// makes the engine route to api.moonshot.ai / api.deepseek.com and swap the model IDs
// (moonshotai/kimi-k2.6 → kimi-k2.6, deepseek/deepseek-v4-pro → deepseek-v4-pro).
// Requires MOONSHOT_API_KEY + DEEPSEEK_API_KEY (both verified present + smoke-tested).
// gemini-3.5-flash is intentionally dropped: a lightweight voice dilutes a
// deep architecture plan. The 4th seat is a second reasoning model instead.
//
// Members have NO file access (the remote members cannot browse), so every
// piece of evidence is inlined into the prompt. The seed is the existing Tier 10
// plan (the "description"); the ladder proposal supplies the promotion grammar
// (Tests 1-7 + T10-a/b/c) and the ceiling argument.
//
// Output (hope/ip_hope_more_tiers/tier10_council/):
//   tier10_council_result.json              — full deliberation trace
//   tier10_council_deliberation.md          — human-readable trace
//   tier10_detailed_implementation_plan.md  — the ratified consensus plan

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { formatModelCouncilMarkdown, runModelCouncil } from "../src/core/services/modelCouncil";

const ROOT = "/home/dstefanescu/other_systems/o4";
const ARCHIVE = path.join(ROOT, "hope/ip_hope_more_tiers/hope_program_archive/03_tiers");
const OUT_DIR = path.join(ROOT, "hope/ip_hope_more_tiers/tier10_council");

const SEED_TIER10 = path.join(ARCHIVE, "tier10_implementation_plan.md");
const LADDER_PROPOSAL = path.join(ARCHIVE, "tiers_9_to_13_proposal.md");

function buildPrompt(tier10: string, ladder: string): string {
  return [
    "# Task — produce the DETAILED IP-HOPE Tier 10 implementation plan",
    "",
    "You are a four-member engineering council designing the production build plan for",
    "**IP-HOPE Tier 10 — Priced Objectives and Mission Negotiation**. Tier 10 unfreezes",
    "assumption F2 (objectives are exogenous): every tier through 9 *satisfies* the",
    "constraints (π_f, deadlines, ω_f, κ_E); Tier 10 *prices* them and emits exchange-rate",
    "proposals to the holder of mission authority, while possessing ZERO authority to act.",
    "",
    "The SEED below is an engineering sketch (the agreed description of what Tier 10 is).",
    "Your job is NOT to re-argue what Tier 10 should be — that is settled. Your job is to",
    "turn the sketch into the detailed, buildable plan a team of 2-3 engineers could execute",
    "over the ~2-month critical path without further design authority.",
    "",
    "## What the detailed plan MUST contain (beyond the seed's altitude)",
    "",
    "1. **Module / file decomposition.** For each component U0-U5 (PriceLedger,",
    "   ExchangeRateEngine, ProposalGenerator, AcceptanceGate+PolicyEnvelope store,",
    "   CalibrationTracker, Negotiation API/frontier surfaces): concrete files, the",
    "   public interface (function/type signatures), and where it lives relative to the",
    "   existing IP-HOPE tier layout. Name the dual-extraction adapter per price-catalog row.",
    "2. **Data schemas.** Exact field-level schemas for PriceLedger entries, PriceCertificate,",
    "   PolicyEnvelope, the AcceptanceGate audit record, and the quoted-vs-realized",
    "   calibration record — including provenance fields (plan_hash, cert_hash, ring, gap,",
    "   unit_map_hash) and units. Specify the single normalized unit map (I10.5).",
    "3. **Algorithms in pseudocode.** Especially: U1 trust-region computation (the analytic",
    "   rate + re-solve ladder + secant-agreement interval + asymmetric relax/tighten",
    "   regions + closed-form short-circuit), U1 cross-quantity chained quotes with the",
    "   binding-set / trust-region-overlap guard, U2 proposal ranking with the",
    "   guarantee-class-impact check and hysteresis, U4 calibration coverage with the",
    "   Clopper-Pearson bound and the revocation/restoration state machine.",
    "4. **Adapter inventory.** Map EACH row of the seed's price catalog (§2) to the concrete",
    "   solver output it reads, the extraction code shape (≤~100 lines each), and whether it",
    "   emits a point or an interval (I10.4 — Ring-1 sources are interval-valued).",
    "5. **Test specifications with measurable thresholds.** Inherited Tests 1-7 plus T10-a",
    "   (price calibration — reproduce the §2 worked example end-to-end: analytic -21% vs",
    "   exact -17.6% with the trust region drawn), T10-b (proposal hygiene — the adversarial",
    "   acceptance deck: malformed/expired/revoked/spoofed envelopes, range-edge probing),",
    "   T10-c (value — missions completed under negotiated constraints infeasible under static",
    "   ones, with no guarantee-class downgrade). Give pass/fail thresholds, fixtures, and the",
    "   shadow-corpus / twin data each test runs on.",
    "6. **Lifecycle gates.** The SHADOW (M2) → LIMITED-ACTIVE human-only (M3) →",
    "   envelope-bound auto-acceptance (M4) → ACTIVE promotion, with the concrete exit",
    "   criterion and the rollback drill (constraint-store restore + quoting freeze)",
    "   demonstrated from every state.",
    "7. **Consumer contracts.** The read interfaces Tier 9 (randomization premium), Tier 11",
    "   (actuation-energy prices), and Tier 13 (evidence bundles cite PriceCertificates)",
    "   consume — enough that those tiers can integrate without re-opening Tier 10.",
    "8. **Milestone-by-milestone deliverables and effort.** Refine the seed's M0-M5 into a",
    "   work-unit backlog: per milestone, the deliverables, the exit gate, the dependency",
    "   edges, and a rough effort estimate.",
    "",
    "## Hard constraints (do NOT relax these — they are invariants, not preferences)",
    "",
    "- Preserve invariants I10.1-I10.6 EXACTLY. In particular I10.1 (proposals only — Tier 10",
    "  never writes a constraint except through the AcceptanceGate, which requires a human",
    "  signature or a pre-signed PolicyEnvelope) and I10.6 (envelope scope strictly narrower",
    "  than quoting scope; revoked-calibration families go inert).",
    "- Tier 10 mints no authority and no envelopes (actions-consume-trust-never-mint, per the",
    "  Tier 8 action algebra A5). Envelope creation is external, signed tooling.",
    "- No new mathematics and no new solver: every price is a by-product of a solver already",
    "  running. The only new code is extraction, normalization, trust-regioning, the gate,",
    "  and calibration tracking.",
    "- Approximate (Ring-1) solvers yield price INTERVALS, not points; point quotes from a",
    "  gapped solver are invalid evidence (I10.4).",
    "- Respect the IP-HOPE energy regime and architecture rules; this is gateway-side",
    "  observability and negotiation, never node-side.",
    "",
    "## Output requirements",
    "",
    "- Your CANDIDATE_CONSENSUS must BE the full detailed implementation plan, in Markdown,",
    "  structured by the eight points above. It must be concrete enough to hand to engineers.",
    "- Where the seed is underspecified, RESOLVE it with a concrete decision and a one-line",
    "  rationale — do not just flag it. State residual confidence (high/moderate/low/unknown)",
    "  on the load-bearing choices (trust-region tolerance, revocation thresholds, dwell/",
    "  hysteresis defaults, the unit map).",
    "- Cite the seed's section/invariant numbers (§2, I10.2, U1, T10-b, M3, ...) so the plan",
    "  is traceable to the description.",
    "- Lead each member's independent proposal with its single sharpest disagreement with the",
    "  seed or with a peer, before converging. Precision over length; no padding.",
    "",
    "=== SEED: Tier 10 description (tier10_implementation_plan.md) ===",
    tier10.trim(),
    "=== END SEED ===",
    "",
    "=== LADDER CONTEXT: promotion grammar + ceiling argument (tiers_9_to_13_proposal.md) ===",
    ladder.trim(),
    "=== END LADDER CONTEXT ===",
  ].join("\n");
}

async function main() {
  // Roster + reasoning-model timeout (kimi/deepseek run ~4-5 min/call).
  if (!process.env.AGENTS_COUNCIL_MEMBERS) {
    process.env.AGENTS_COUNCIL_MEMBERS = "claude,chatgpt,kimi,deepseek";
  }
  if (!process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS) {
    process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS = "600000";
  }
  // Direct vendor APIs for kimi/deepseek (not OpenRouter). The engine swaps the
  // provider + model IDs when this is set; the same timeout env governs both paths.
  if (!process.env.AGENTS_COUNCIL_DIRECT_VENDOR_KEYS) {
    process.env.AGENTS_COUNCIL_DIRECT_VENDOR_KEYS = "1";
  }

  await mkdir(OUT_DIR, { recursive: true });

  const tier10 = await readFile(SEED_TIER10, "utf8");
  const ladder = await readFile(LADDER_PROPOSAL, "utf8");
  const prompt = buildPrompt(tier10, ladder);

  await writeFile(path.join(OUT_DIR, "tier10_council_prompt.txt"), prompt, "utf8");
  console.log(`Roster: ${process.env.AGENTS_COUNCIL_MEMBERS}`);
  console.log(`Prompt: ${prompt.length} chars (~${Math.round(prompt.length / 4)} tokens)`);
  console.log(`Timeout: ${process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS}ms`);
  console.log(
    `Direct vendor keys: ${process.env.AGENTS_COUNCIL_DIRECT_VENDOR_KEYS} (kimi→Moonshot, deepseek→DeepSeek direct)`,
  );

  const t0 = Date.now();
  const result = await runModelCouncil({ prompt });
  const elapsedMin = ((Date.now() - t0) / 60000).toFixed(1);

  const jsonPath = path.join(OUT_DIR, "tier10_council_result.json");
  await writeFile(jsonPath, JSON.stringify(result, null, 2), "utf8");

  const trace = formatModelCouncilMarkdown(result);
  const tracePath = path.join(OUT_DIR, "tier10_council_deliberation.md");
  await writeFile(tracePath, trace, "utf8");

  // The ratified consensus IS the detailed plan.
  const header = [
    "# IP-HOPE Tier 10 — Detailed Implementation Plan",
    "## Priced Objectives and Mission Negotiation (council-synthesized)",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    `**Council:** ${result.members.map((m) => `${m.name} (${m.model})`).join(", ")}`,
    `**Consensus outcome:** ${result.consensus.outcome} (reached=${result.consensus.reached})`,
    `**Rounds:** ${result.rounds.length}  ·  **Wall-clock:** ${elapsedMin} min`,
    "**Seed:** hope_program_archive/03_tiers/tier10_implementation_plan.md",
    "",
    "> This plan is the council's ratified candidate consensus. The full deliberation",
    "> trace (each member's proposals, critiques, and ratification votes) is in",
    "> `tier10_council_deliberation.md`; the raw result in `tier10_council_result.json`.",
    "",
    "---",
    "",
  ].join("\n");
  const planPath = path.join(OUT_DIR, "tier10_detailed_implementation_plan.md");
  await writeFile(planPath, header + (result.candidateConsensus || "(empty consensus)"), "utf8");

  console.log(`\noutcome=${result.consensus.outcome} reached=${result.consensus.reached}`);
  console.log(`rounds=${result.rounds.length} elapsed=${elapsedMin}min`);
  console.log(`ratifications: ${result.ratifications.map((r) => `${r.member.name}=${r.vote.decision}`).join(", ")}`);
  console.log(`consensus length: ${result.candidateConsensus.length} chars`);
  console.log(`\nWrote:\n  ${planPath}\n  ${tracePath}\n  ${jsonPath}`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});

// One-off runner: 4-member model council over the Tier 11 implementation plan.
// Reads the tier-11 doc from disk and embeds it in the prompt (OpenRouter
// members kimi/deepseek have no file access, so the text must be inline).
// Mirrors the official `council solve` action: runModelCouncil -> save -> print.
import { readFileSync } from "node:fs";
import {
  runModelCouncil,
  saveModelCouncilRun,
  formatModelCouncilMarkdown,
} from "../src/core/services/modelCouncil.ts";

const TIER11_PATH =
  "/home/dstefanescu/other_systems/o4/hope/ip_hope_more_tiers/hope_program_archive/03_tiers/tier11_implementation_plan.md";

const doc = readFileSync(TIER11_PATH, "utf8");

const prompt = `You are a technical review council evaluating ONE design document: the implementation plan for "Tier 11 — Embodied Network Shaping" of the IP-HOPE program (an energy-constrained IoT routing / network-control research program; lower tiers provide a certified routing+control stack used here as an evaluation oracle). Ground every claim ONLY in the text provided below — do not assume facts about lower tiers beyond what the text states.

Deliberate and reach a ratified consensus answering, in this order:

1. STRONGEST OBJECTION FIRST. State the single most serious reason this plan could fail or should not be built as written, before any praise.
2. WHAT IT IS. In plain language, what does Tier 11 actually try to do, and what is the core technical bet (the "geometry value function" V(g), reversibility classes R0/R1/R2, motion envelopes + ActuationGate, the two-timescale oracle loop)?
3. SOUNDNESS & NOVELTY. Is the central idea — planning changes to the network's own geometry, evaluated by lower tiers as an oracle and priced by Tier 10 — coherent and non-trivial? Where is it merely renaming existing machinery vs. adding real capability?
4. FEASIBILITY AS SPECIFIED. Assess the hard parts: the post-move gain re-calibration cost (§4.5, flagged as the most underestimated), the oracle evaluation contract (§4.3), two-timescale convergence (§4.4), and the invariants in §1.3. Are the staging/milestones (§6), failure-mode fallback chain (§7), and risk register (§8) adequate, or do they hide the real risk?
5. RECOMMENDATION. One clear verdict: BUILD AS SPECIFIED / BUILD WITH NAMED MODIFICATIONS / DEFER / KILL. If modifications, name the single highest-value change. Be concrete and decision-forcing; do not hedge.

=== BEGIN TIER 11 IMPLEMENTATION PLAN ===
${doc}
=== END TIER 11 IMPLEMENTATION PLAN ===`;

console.error(`[tier11-council] prompt chars: ${prompt.length}`);
console.error(`[tier11-council] members: ${process.env.AGENTS_COUNCIL_MEMBERS ?? "(default)"}`);
console.error(`[tier11-council] openrouter timeout ms: ${process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS ?? "(default 300000)"}`);

const result = await runModelCouncil({ prompt });

try {
  const saved = await saveModelCouncilRun(result);
  console.error(`[tier11-council] saved JSON: ${saved.jsonPath}`);
  console.error(`[tier11-council] saved MD:   ${saved.markdownPath}`);
} catch (e) {
  console.error(`[tier11-council] WARN save failed: ${e instanceof Error ? e.message : String(e)}`);
}

const c = result.consensus;
console.log("==== COUNCIL SUMMARY ====");
console.log(`OUTCOME: ${c.outcome}  reached=${c.reached}`);
console.log(`RATIFIED_BY: ${JSON.stringify(c.ratifiedBy)}`);
console.log(`BLOCKED_BY: ${JSON.stringify(c.blockedBy)}`);
console.log(`ROUNDS: ${result.rounds?.length}`);
if ((result as { minorityReport?: unknown }).minorityReport) {
  console.log("MINORITY_REPORT: present");
}
console.log("==== CONSENSUS (markdown) ====");
console.log(formatModelCouncilMarkdown(result));

process.exitCode = c.outcome === "blocked" ? 1 : 0;

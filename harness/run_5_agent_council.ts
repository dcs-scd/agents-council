#!/usr/bin/env bun
// Drive five sequential council sessions, one per lens, each with the
// Andreessen voice as the "agent description" and 55p_ideas.md as the seed.
// One Claude summon per session. Outputs land in harness/.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { CouncilServiceImpl } from "../src/core/services/council";
import { summonClaudeAgent } from "../src/core/services/council/summon";
import { FileCouncilStateStore } from "../src/core/state/fileStateStore";

const HARNESS_DIR = "/home/dstefanescu/other_systems/o4/agents-council/harness";
const ANDREESSEN_PATH = "/home/dstefanescu/other_systems/o4/andreesen_prompt.txt";
const SEED_PATH = path.join(HARNESS_DIR, "55p_ideas.md");
const TOPIC = "How do we get an agent to learn its harness?";

type Lens = { name: string; tag: string; brief: string };
const LENSES: Lens[] = [
  {
    name: "Contrarian",
    tag: "contrarian",
    brief:
      "Pressure-test the premise of the seed. Find the fatal flaws, fragile assumptions, missing failure modes. Name the single sharpest objection.",
  },
  {
    name: "Executor",
    tag: "executor",
    brief:
      "Feasibility, sequencing, dependencies, real first move. If the user could ship ONE thing this week, what is it? Give 3 numbered work units with ROI.",
  },
  {
    name: "Expansionist",
    tag: "expansionist",
    brief:
      "Asymmetric upside. Leverage. The 10x play in the seed that the other lenses will miss. Rank the upside plays.",
  },
  {
    name: "First-principles",
    tag: "first-principles",
    brief:
      "Re-derive from fundamentals. Strip away the seed's inherited assumptions. Identify the irreducible primitives of harness learning and which actually apply.",
  },
  {
    name: "Outsider",
    tag: "outsider",
    brief:
      "Flag jargon, insider assumptions, missing context. What is the smart-non-insider's view? End with the single most important question the seed's author has not answered.",
  },
];

function buildRequest(andreesen: string, seed: string, lens: Lens): string {
  return [
    "## Agent description (voice — read first, apply throughout)",
    "",
    andreesen,
    "",
    `## Your lens: ${lens.name}`,
    "",
    lens.brief,
    "",
    "## Topic",
    "",
    TOPIC,
    "",
    "## Seed proposal (this is what you are reacting to)",
    "",
    "The user has authored a v0 proposal on this topic and wants you to react to IT, not riff in the void. Engage the seed's claims, identify what it gets right, where it overreaches, and what it misses.",
    "",
    "--- SEED START ---",
    seed.trim(),
    "--- SEED END ---",
    "",
    "## Output requirements",
    "",
    "- Lead with the strongest counterargument to the seed before any agreement.",
    "- 250–450 words. Precise, not padded. Andreessen voice throughout.",
    "- Explicit confidence on your overall verdict: high / moderate / low / unknown.",
    "- End with ONE line: `STRONGEST CLAIM: <one sentence>`.",
    "- When you call send_response, send the WHOLE response in one call. Do not chunk.",
  ].join("\n");
}

async function main() {
  const andreesen = (await readFile(ANDREESSEN_PATH, "utf8")).trim();
  const seed = await readFile(SEED_PATH, "utf8");

  const store = new FileCouncilStateStore();
  const service = new CouncilServiceImpl(store);

  type Result = {
    lens: string;
    tag: string;
    sessionId: string;
    agentName: string;
    content: string;
    model: string | null;
    createdAt: string;
  };
  const results: Result[] = [];

  for (const lens of LENSES) {
    const banner = `=== ${lens.name} (${lens.tag}) ===`;
    console.log("\n" + banner);
    const t0 = Date.now();

    const requestText = buildRequest(andreesen, seed, lens);

    // Each lens runs in its own fresh active council session.
    const started = await service.startCouncil({ request: requestText, agentName: "orchestrator" });
    console.log(`session ${started.session.id} started; request ${started.request.id}`);

    // Summon one Claude agent. readOnlyEvidence:false — the seed is inlined; no file IO needed.
    let content = "";
    let model: string | null = null;
    try {
      const summon = await summonClaudeAgent({
        agent: lens.name, // distinct participant name per lens
        readOnlyEvidence: false,
        workingDirectory: HARNESS_DIR,
      });
      content = summon.feedback.content;
      model = summon.model;
      console.log(`summoned ${summon.agent} via ${summon.model ?? "default model"} in ${Date.now() - t0}ms`);
    } catch (err: unknown) {
      content = `ERROR during summon: ${err instanceof Error ? err.message : String(err)}`;
      console.error(content);
    }

    // Close the session so the next lens has a clean active slot.
    await service.closeSession({
      agentName: "orchestrator",
      sessionId: started.session.id,
      conclusion: `Lens '${lens.name}' completed.`,
    });

    results.push({
      lens: lens.name,
      tag: lens.tag,
      sessionId: started.session.id,
      agentName: lens.name,
      content,
      model,
      createdAt: new Date().toISOString(),
    });
  }

  // Persist outputs.
  const jsonPath = path.join(HARNESS_DIR, "council_results.json");
  await writeFile(jsonPath, JSON.stringify({ topic: TOPIC, seed: "55p_ideas.md", results }, null, 2));

  const md: string[] = [
    "# 5-Agent Council — Harness Learning",
    "",
    `**Topic.** ${TOPIC}`,
    "",
    "**Voice.** Each agent operates under `andreesen_prompt.txt` (lead with strongest counterargument; explicit confidence; no flattery).",
    "",
    "**Seed.** `55p_ideas.md` (v0 proposal: harness-learning curriculum + trace-to-delta loop).",
    "",
    "---",
  ];
  for (const r of results) {
    md.push("", `## ${r.lens}`, "", `*session ${r.sessionId} · model ${r.model ?? "default"}*`, "", r.content);
  }
  const mdPath = path.join(HARNESS_DIR, "council_results.md");
  await writeFile(mdPath, md.join("\n"));

  console.log("\nWrote", jsonPath);
  console.log("Wrote", mdPath);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});

import { describe, expect, test } from "bun:test";

import { buildProposalMessages, type EvidencePackEntry, type ModelCouncilMember } from "./modelCouncil";

// WU-B3: evidence-pack input plumbing. These tests pin the two invariants the
// unit must hold: (a) a supplied pack is prepended to the round-0 proposal
// system message and is citable by id; (b) omitting the pack reproduces the
// legacy proposal messages byte-for-byte (INV-2).

const member: ModelCouncilMember = {
  id: "claude",
  name: "Opus 4.8",
  provider: "claude",
  model: "claude-test",
};

const pack: EvidencePackEntry[] = [
  { id: "EV-1", text: "The repo uses Bun as its runtime.", source: "package.json" },
  { id: "EV-2", text: "Council members carry equal weight.", source: "docs/council.md" },
];

describe("WU-B3 evidence-pack proposal plumbing", () => {
  test("supplied pack prepends its entries to the round-0 proposal system message", () => {
    const messages = buildProposalMessages("Pick an architecture", member, pack);
    const system = messages[0]?.content;
    expect(typeof system).toBe("string");
    const systemText = system as string;

    // Each entry appears, keyed by its [id], with source and text, so a
    // downstream Level-1 source-ID check (WU-B2) can cite them.
    expect(systemText).toContain("[EV-1]");
    expect(systemText).toContain("(package.json)");
    expect(systemText).toContain("The repo uses Bun as its runtime.");
    expect(systemText).toContain("[EV-2]");
    expect(systemText).toContain("(docs/council.md)");
    expect(systemText).toContain("Council members carry equal weight.");

    // The pack is prepended ahead of the legacy directive, not appended.
    expect(systemText.indexOf("[EV-1]")).toBeLessThan(systemText.indexOf("one member of a multi-agent council"));

    // The user message still carries the raw prompt unchanged.
    expect(messages[1]).toEqual({ role: "user", content: "Pick an architecture" });
  });

  test("omitting the pack yields byte-identical legacy proposal messages", () => {
    const legacy = buildProposalMessages("Pick an architecture", member);
    const emptyPack = buildProposalMessages("Pick an architecture", member, []);

    // Both the no-arg and explicit-empty-pack paths reproduce identical bytes:
    // an empty pack must be indistinguishable from supplying no pack at all.
    expect(emptyPack).toEqual(legacy);

    // The legacy system message starts with the member identity line and never
    // carries any evidence-pack scaffolding when no pack is supplied (INV-2).
    const legacySystem = legacy[0]?.content as string;
    expect(legacySystem.startsWith(`You are ${member.name}, one member of a multi-agent council.`)).toBe(true);
    expect(legacySystem).not.toContain("Evidence pack");
    expect(legacySystem).not.toContain("[EV-1]");
    expect(legacy[1]).toEqual({ role: "user", content: "Pick an architecture" });
  });
});

import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import {
  buildCandidateConsensus,
  buildConsensusResult,
  buildDeliberationMessages,
  buildRatificationMessages,
  councilOutcomeExitCode,
  flattenMessageContent,
  formatModelCouncilMarkdown,
  isRatifiedWithEdits,
  nominateCandidateConsensus,
  parseRatificationVote,
  runModelCouncil,
  shouldAttemptRepair,
  type EvidencePackEntry,
  type MemberRef,
  type ModelCouncilCandidateProposal,
  type ModelCouncilMember,
  type ModelCouncilRatification,
  type ModelCouncilResponse,
  type ModelCouncilResult,
  type ModelCouncilRound,
} from "./modelCouncil";

// Lane A — outcome semantics + deliberation epistemics.
//   A1 ratified_with_edits + engine-native fold
//   A2 quorum guard
//   A3 peer anonymization in mid-run prompts
//   A4 markerless-exclusion + PREFERRED_DRAFT approval nomination
//   A5 evidence pack in ratification prompts

// Build a ratification exactly as the engine does so fixture votes never drift.
function ratification(member: MemberRef, content: string): ModelCouncilRatification {
  const vote = parseRatificationVote(content);
  return { member, content, accepted: vote.decision === "accept", vote };
}

const members: ModelCouncilMember[] = [
  { id: "kimi", name: "Kimi K2.6", provider: "openrouter", model: "kimi-test" },
  { id: "deepseek", name: "DeepSeek V4 Pro", provider: "openrouter", model: "deepseek-test" },
  { id: "chatgpt", name: "ChatGPT 5.5", provider: "codex", model: "chatgpt-test" },
];

// --- env harness (all Lane A end-to-end tests share the process env) ----------
const ENV_KEYS = [
  "AGENTS_COUNCIL_MEMBERS",
  "AGENTS_COUNCIL_ALLOW_SOLO",
  "OPENROUTER_API_KEY",
  "AGENTS_COUNCIL_OPENROUTER_URL",
  "AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS",
  "AGENTS_COUNCIL_MAX_ROUNDS",
  "AGENTS_COUNCIL_STRUCTURED",
] as const;
let envSnapshot = new Map<string, string | undefined>();
beforeEach(() => {
  envSnapshot = new Map(ENV_KEYS.map((key) => [key, process.env[key]]));
});
afterEach(() => {
  for (const [key, value] of envSnapshot) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

// Mock OpenRouter transport: reply with the next canned body per call. `failAt`
// (a call index) returns an HTTP 400 instead, so askOpenRouter throws immediately
// (400 is not retried) — used to exercise the A1 fold-call-failure fallback.
function mockOpenRouter(
  canned: string[],
  failAt?: number,
): { server: ReturnType<typeof Bun.serve>; calls: () => number } {
  let index = 0;
  const server = Bun.serve({
    port: 0,
    fetch: () => {
      const at = index;
      index += 1;
      if (failAt !== undefined && at === failAt) {
        return new Response(JSON.stringify({ error: { message: "fold boom" } }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const content = canned[at] ?? canned[canned.length - 1];
      return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
        headers: { "Content-Type": "application/json" },
      });
    },
  });
  return { server, calls: () => index };
}

function setSoloEnv(server: ReturnType<typeof Bun.serve>): void {
  process.env.AGENTS_COUNCIL_MEMBERS = "kimi";
  process.env.AGENTS_COUNCIL_ALLOW_SOLO = "1";
  process.env.OPENROUTER_API_KEY = "test-key";
  process.env.AGENTS_COUNCIL_OPENROUTER_URL = server.url.toString();
  process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS = "5000";
  process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";
}

// =============================================================================
// A1 — ratified_with_edits outcome + engine-native fold
// =============================================================================
describe("A1 ratified_with_edits classification (buildConsensusResult)", () => {
  test("ACCEPT_WITH_EDITS-only slate is ratified_with_edits, reached, AWE voters are NOT blockers", () => {
    const awe = ratification(members[0]!, "CONSENSUS: ACCEPT_WITH_EDITS\nREQUIRED_EDITS: state the cost tradeoff.");
    const accept = ratification(members[1]!, "CONSENSUS: ACCEPT");

    const consensus = buildConsensusResult([awe, accept], members);

    expect(consensus.outcome).toBe("ratified_with_edits");
    expect(consensus.reached).toBe(true);
    expect(consensus.acceptedWithEditsBy).toEqual([members[0]!.name]);
    expect(consensus.ratifiedBy).toEqual([members[1]!.name]);
    // The AWE voter is never misclassified as a blocker.
    expect(consensus.blockedBy).toEqual([]);
    // ratified_with_edits is a success exit (0).
    expect(councilOutcomeExitCode(consensus.outcome)).toBe(0);
  });

  test("all-ACCEPT stays a clean ratified with no acceptedWithEditsBy", () => {
    const consensus = buildConsensusResult(
      members.map((member) => ratification(member, "CONSENSUS: ACCEPT")),
      members,
    );
    expect(consensus.outcome).toBe("ratified");
    expect(consensus.acceptedWithEditsBy).toBeUndefined();
  });

  test("AWE + a plain BLOCK is blocked, and the AWE voter is not counted as a blocker", () => {
    const awe = ratification(members[0]!, "CONSENSUS: ACCEPT_WITH_EDITS\nREQUIRED_EDITS: tweak intro.");
    const block = ratification(members[1]!, "CONSENSUS: BLOCK\nBLOCK_KIND: INSUFFICIENT_EVIDENCE\nNeeds a benchmark.");

    const consensus = buildConsensusResult([awe, block], members);

    expect(consensus.outcome).toBe("blocked");
    expect(consensus.blockedBy).toEqual([members[1]!.name]);
    expect(consensus.acceptedWithEditsBy).toEqual([members[0]!.name]);
    expect(isRatifiedWithEdits([awe, block])).toBe(false);
  });

  test("AWE + an absolute veto is blocked and never folds", () => {
    const awe = ratification(members[0]!, "CONSENSUS: ACCEPT_WITH_EDITS\nREQUIRED_EDITS: tweak intro.");
    const veto = ratification(members[1]!, "CONSENSUS: BLOCK\nBLOCK_KIND: FACTUAL_ERROR\nThe source says nine.");

    expect(buildConsensusResult([awe, veto], members).outcome).toBe("blocked");
    expect(isRatifiedWithEdits([awe, veto])).toBe(false);
    expect(shouldAttemptRepair([awe, veto])).toBe(false);
  });
});

describe("A1 engine-native fold (end-to-end)", () => {
  test("an ACCEPT_WITH_EDITS-only ratification folds once and records ratified_with_edits", async () => {
    // Solo roster keeps call order deterministic: propose(0), deliberate(1),
    // ratify AWE(2), fold synthesis(3). Repair is skipped (AWE is not a BLOCK), so
    // the fold runs on the first-round slate — and is NOT re-ratified.
    const { server, calls } = mockOpenRouter([
      "Initial independent answer.",
      "Critique.\nCANDIDATE_CONSENSUS:\nDraft v1 recommends option A for every tier.",
      "CONSENSUS: ACCEPT_WITH_EDITS\nREQUIRED_EDITS: also state the cost tradeoff before shipping.",
      "Folding.\nCANDIDATE_CONSENSUS:\nDraft v2 recommends option A for every tier and states the cost tradeoff.",
    ]);
    setSoloEnv(server);
    try {
      const result = await runModelCouncil({ prompt: "Review the tiers" });

      expect(result.consensus.outcome).toBe("ratified_with_edits");
      expect(result.consensus.reached).toBe(true);
      expect(result.consensus.acceptedWithEditsBy).toEqual([members[0]!.name]);
      expect(result.consensus.blockedBy).toEqual([]);
      // The fold ran exactly once (chair synthesis was call index 3 -> 4 total calls).
      expect(calls()).toBe(4);
      expect(result.fold).toBeDefined();
      expect(result.fold?.foldError).toBeUndefined();
      expect(result.fold?.foldedEdits).toHaveLength(1);
      expect(result.fold?.foldedEdits[0]?.requiredEdits).toContain("cost tradeoff");
      // Candidate is the folded text; the fold was NOT re-ratified.
      expect(result.candidateConsensus).toContain("Draft v2");
      expect(result.candidateConsensus).toContain("cost tradeoff");
      expect(result.repair).toBeUndefined();
      expect(councilOutcomeExitCode(result.consensus.outcome)).toBe(0);
    } finally {
      server.stop(true);
    }
  });

  test("a failed fold call keeps the unfolded candidate and records foldError (never blocked)", async () => {
    // Same slate, but the chair's fold call (index 3) fails with HTTP 400. The
    // outcome stays ratified_with_edits and the candidate is the pre-fold draft.
    const { server } = mockOpenRouter(
      [
        "Initial independent answer.",
        "Critique.\nCANDIDATE_CONSENSUS:\nDraft v1 recommends option A.",
        "CONSENSUS: ACCEPT_WITH_EDITS\nREQUIRED_EDITS: add the tradeoff.",
      ],
      3,
    );
    setSoloEnv(server);
    try {
      const result = await runModelCouncil({ prompt: "Review the tiers" });

      expect(result.consensus.outcome).toBe("ratified_with_edits");
      expect(result.fold).toBeDefined();
      expect(result.fold?.foldError).toBeDefined();
      expect(result.fold?.foldedEdits).toHaveLength(1);
      // Unfolded candidate is retained on fold failure.
      expect(result.candidateConsensus).toContain("Draft v1");
      expect(result.candidateConsensus).not.toContain("Draft v2");
    } finally {
      server.stop(true);
    }
  });

  test("AWE + absolute veto blocks with no fold and no repair (end-to-end)", async () => {
    // Two members: one AWE, one FACTUAL_ERROR veto. The veto gates both repair and
    // the fold off, so only propose(0,1) + deliberate(2,3) + ratify(4,5) run.
    const { server, calls } = mockOpenRouter([
      "Answer A.",
      "Answer B.",
      "Critique.\nCANDIDATE_CONSENSUS:\nShared draft: option A across tiers.",
      "Critique.\nCANDIDATE_CONSENSUS:\nShared draft: option A across tiers.",
      "CONSENSUS: ACCEPT_WITH_EDITS\nREQUIRED_EDITS: tighten the intro.",
      "CONSENSUS: BLOCK\nBLOCK_KIND: MATERIAL_DISAGREEMENT\nWe disagree on the core tradeoff.",
      // These would flip to ratified if consumed — they must not be.
      "Folding.\nCANDIDATE_CONSENSUS:\nFolded draft.",
      "CONSENSUS: ACCEPT",
    ]);
    process.env.AGENTS_COUNCIL_MEMBERS = "kimi,deepseek";
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENTS_COUNCIL_OPENROUTER_URL = server.url.toString();
    process.env.AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS = "5000";
    process.env.AGENTS_COUNCIL_MAX_ROUNDS = "1";
    try {
      const result = await runModelCouncil({ prompt: "How many backends?" });

      expect(result.consensus.outcome).toBe("blocked");
      expect(result.fold).toBeUndefined();
      expect(result.repair).toBeUndefined();
      // No fold/repair calls were dispatched (6 = propose 2 + deliberate 2 + ratify 2).
      expect(calls()).toBe(6);
    } finally {
      server.stop(true);
    }
  });
});

describe("A1 markdown rendering", () => {
  const base = {
    prompt: "Evaluate the engine",
    members,
    responses: members.map((member) => ({ member, content: `${member.name} proposal` })) as ModelCouncilResponse[],
    deliberations: [] as ModelCouncilCandidateProposal[],
    rounds: [] as ModelCouncilRound[],
  };

  test("ratified_with_edits renders its own title and a Folded Edits section", () => {
    const result: ModelCouncilResult = {
      ...base,
      candidateConsensus: "Folded final consensus.",
      converged: true,
      ratifications: [ratification(members[0]!, "CONSENSUS: ACCEPT_WITH_EDITS\nREQUIRED_EDITS: state the tradeoff.")],
      fold: {
        synthesizedBy: members[0]!,
        foldedEdits: [{ member: members[0]!, requiredEdits: "state the tradeoff." }],
      },
      consensus: buildConsensusResult(
        [ratification(members[0]!, "CONSENSUS: ACCEPT_WITH_EDITS\nREQUIRED_EDITS: state the tradeoff.")],
        members,
      ),
    };

    const markdown = formatModelCouncilMarkdown(result);
    expect(markdown).toContain("# Council Consensus (Ratified with Edits)");
    expect(markdown).not.toContain("# Council Consensus Blocked");
    expect(markdown).not.toContain("# Council Consensus Not Reached");
    expect(markdown).toContain("## Folded Edits");
    expect(markdown).toContain("state the tradeoff.");
    expect(markdown).toContain("Outcome: ratified_with_edits");
    expect(markdown).toContain(`Accepted with edits by: ${members[0]!.name}`);
  });
});

// =============================================================================
// A2 — quorum guard
// =============================================================================
describe("A2 quorum guard", () => {
  test("a solo roster throws at roster resolution unless the opt-in is set", async () => {
    process.env.AGENTS_COUNCIL_MEMBERS = "kimi";
    delete process.env.AGENTS_COUNCIL_ALLOW_SOLO;
    // The throw is at roster resolution, before any network call — no server needed.
    await expect(runModelCouncil({ prompt: "solo throws" })).rejects.toThrow(/at least 2 members/);
  });

  test("AGENTS_COUNCIL_ALLOW_SOLO=1 runs the solo council and flags solo:true", async () => {
    const { server } = mockOpenRouter([
      "Initial answer.",
      "Critique.\nCANDIDATE_CONSENSUS:\nSolo candidate.",
      "CONSENSUS: ACCEPT",
    ]);
    setSoloEnv(server);
    try {
      const result = await runModelCouncil({ prompt: "solo runs" });
      // A council of one is flagged, never a silent plain ratified.
      expect(result.solo).toBe(true);
      expect(result.consensus.outcome).toBe("ratified");
    } finally {
      server.stop(true);
    }
  });
});

// =============================================================================
// A3 — peer anonymization in mid-run prompts
// =============================================================================
describe("A3 peer anonymization", () => {
  // Fixtures whose CONTENT carries no member names/models, so any leaked identity
  // would come only from the (now anonymized) peer labels the builder writes.
  const anonMembers: ModelCouncilMember[] = [
    { id: "kimi", name: "Alpha Model", provider: "openrouter", model: "alpha-x" },
    { id: "deepseek", name: "Beta Model", provider: "openrouter", model: "beta-y" },
  ];
  const anonResponses: ModelCouncilResponse[] = [
    { member: anonMembers[0]!, content: "Position one." },
    { member: anonMembers[1]!, content: "Position two." },
  ];
  const anonProposals: ModelCouncilCandidateProposal[] = [
    { member: anonMembers[0]!, content: "Draft one.", candidateConsensus: "Draft one." },
    { member: anonMembers[1]!, content: "Draft two.", candidateConsensus: "Draft two." },
  ];
  const anonRounds: ModelCouncilRound[] = [
    {
      index: 1,
      proposals: anonProposals,
      candidateConsensus: "Draft one.",
      changed: true,
      similarityToPrevious: null,
      memberAgreement: 1,
    },
  ];

  function assertNoRealIdentity(text: string): void {
    for (const member of anonMembers) {
      expect(text).not.toContain(member.name);
      expect(text).not.toContain(member.model);
    }
  }

  test("deliberation prompts label peers Member A/B, not by name/model", () => {
    const round1 = buildDeliberationMessages("Q", anonResponses, [], "", anonMembers[0]!, 1);
    const r1User = flattenMessageContent(round1[1]?.content ?? "");
    expect(r1User).toContain("## Member A");
    expect(r1User).toContain("## Member B");
    assertNoRealIdentity(r1User);

    const round2 = buildDeliberationMessages("Q", anonResponses, anonProposals, "Draft one.", anonMembers[0]!, 2);
    const r2User = flattenMessageContent(round2[1]?.content ?? "");
    expect(r2User).toContain("## Member A");
    expect(r2User).toContain("## Member B");
    assertNoRealIdentity(r2User);
  });

  test("ratification prompt labels peers Member A/B, not by name/model", () => {
    const messages = buildRatificationMessages("Q", anonRounds, "Draft one.", anonMembers[0]!);
    const user = flattenMessageContent(messages[1]?.content ?? "");
    expect(user).toContain("## Member A");
    expect(user).toContain("## Member B");
    assertNoRealIdentity(user);
  });

  test("the deliberation prompt asks for a PREFERRED_DRAFT nomination", () => {
    const messages = buildDeliberationMessages("Q", anonResponses, [], "", anonMembers[0]!, 1);
    const system = flattenMessageContent(messages[0]?.content ?? "");
    const user = flattenMessageContent(messages[1]?.content ?? "");
    expect(system).toContain("PREFERRED_DRAFT");
    expect(user).toContain("PREFERRED_DRAFT");
  });

  test("the saved transcript retains real identities and records the label map", () => {
    const result: ModelCouncilResult = {
      prompt: "Q",
      members: anonMembers,
      responses: anonResponses,
      deliberations: anonProposals,
      rounds: anonRounds,
      candidateConsensus: "Draft one.",
      converged: true,
      ratifications: anonMembers.map((member) => ratification(member, "CONSENSUS: ACCEPT")),
      consensus: buildConsensusResult(
        anonMembers.map((member) => ratification(member, "CONSENSUS: ACCEPT")),
        anonMembers,
      ),
      peerLabels: [
        { label: "Member A", member: anonMembers[0]! },
        { label: "Member B", member: anonMembers[1]! },
      ],
    };

    const markdown = formatModelCouncilMarkdown(result);
    // Real identities are preserved in the transcript...
    expect(markdown).toContain("Alpha Model");
    expect(markdown).toContain("Beta Model");
    // ...and the label -> member map is recorded.
    expect(markdown).toContain("## Peer Labels");
    expect(markdown).toContain("Member A = **Alpha Model** (`alpha-x`)");
    expect(markdown).toContain("Member B = **Beta Model** (`beta-y`)");
  });
});

// =============================================================================
// A4 — markerless exclusion + PREFERRED_DRAFT approval nomination
// =============================================================================
describe("A4 candidate nomination (PREFERRED_DRAFT approval voting)", () => {
  test("approval voting picks the majority-approved draft over a longer one", () => {
    const shortDraft = "Use option A.";
    const longDraft = "Use option B, which is longer and elaborates every tier, workload and cost dimension in detail.";
    const proposals: ModelCouncilCandidateProposal[] = [
      { member: members[0]!, content: "PREFERRED_DRAFT: SELF", candidateConsensus: shortDraft },
      { member: members[1]!, content: "PREFERRED_DRAFT: Member A", candidateConsensus: longDraft },
      { member: members[2]!, content: "PREFERRED_DRAFT: Member A", candidateConsensus: "Use option C." },
    ];

    const nomination = nominateCandidateConsensus(proposals);
    expect(nomination.method).toBe("approval");
    // Member A's short draft won 3 approvals despite Member B being the longest.
    expect(nomination.candidate).toBe(shortDraft);
    expect(buildCandidateConsensus(proposals)).toBe(shortDraft);
  });

  test("no parseable PREFERRED_DRAFT falls back to the longest draft", () => {
    const longDraft = "Use option B, which minimizes latency and cost across every tier and workload.";
    const proposals: ModelCouncilCandidateProposal[] = [
      { member: members[0]!, content: "critique", candidateConsensus: "Use A." },
      { member: members[1]!, content: "critique", candidateConsensus: longDraft },
    ];
    const nomination = nominateCandidateConsensus(proposals);
    expect(nomination.method).toBe("longest_fallback");
    expect(nomination.candidate).toBe(longDraft);
  });

  test("byte-identical drafts are a unanimous nomination", () => {
    const draft = "Re-ground each tier to its real decision surface.";
    const proposals = members.map((member) => ({ member, content: "critique", candidateConsensus: draft }));
    const nomination = nominateCandidateConsensus(proposals);
    expect(nomination.method).toBe("unanimous");
    expect(nomination.candidate).toBe(draft);
  });

  test("a protocol-noncompliant (empty) draft cannot be nominated by approval", () => {
    const proposals: ModelCouncilCandidateProposal[] = [
      // Everyone votes for Member A, but Member A contributed no draft.
      { member: members[0]!, content: "PREFERRED_DRAFT: SELF", candidateConsensus: "", protocolNoncompliant: true },
      { member: members[1]!, content: "PREFERRED_DRAFT: Member A", candidateConsensus: "Real draft from B." },
    ];
    const nomination = nominateCandidateConsensus(proposals);
    // The empty draft's votes are discarded; a real draft is nominated instead.
    expect(nomination.candidate).toBe("Real draft from B.");
  });
});

describe("A4 markerless deliberation reply is re-asked once, then excluded (end-to-end)", () => {
  test("a member that stays markerless after one re-ask contributes no draft", async () => {
    const { server, calls } = mockOpenRouter([
      "Initial answer.",
      // deliberation round 1: no CANDIDATE_CONSENSUS marker.
      "I think option A is best, but no marker here.",
      // the single re-ask: still markerless.
      "Still just prose, no marker.",
    ]);
    setSoloEnv(server);
    try {
      const result = await runModelCouncil({ prompt: "Pick an option" });

      const proposal = result.rounds[0]?.proposals[0];
      expect(proposal?.protocolNoncompliant).toBe(true);
      expect(proposal?.candidateConsensus).toBe("");
      expect(result.rounds[0]?.nominationMethod).toBe("none");
      // Excluded -> no candidate -> ratify never ran.
      expect(result.consensus.outcome).toBe("not_attempted");
      // The re-ask fired exactly once: propose(0) + deliberate(1) + re-ask(2) = 3 calls.
      expect(calls()).toBe(3);
    } finally {
      server.stop(true);
    }
  });

  test("a member that recovers on the re-ask contributes its draft", async () => {
    const { server, calls } = mockOpenRouter([
      "Initial answer.",
      // markerless first...
      "Just prose here.",
      // ...compliant on the re-ask.
      "Fixed.\nCANDIDATE_CONSENSUS:\nRecovered candidate draft.",
      "CONSENSUS: ACCEPT",
    ]);
    setSoloEnv(server);
    try {
      const result = await runModelCouncil({ prompt: "Pick an option" });

      const proposal = result.rounds[0]?.proposals[0];
      expect(proposal?.protocolNoncompliant).toBeUndefined();
      expect(proposal?.candidateConsensus).toBe("Recovered candidate draft.");
      expect(result.candidateConsensus).toContain("Recovered candidate draft.");
      // propose(0) + deliberate(1) + re-ask(2) + ratify(3) = 4 calls.
      expect(calls()).toBe(4);
    } finally {
      server.stop(true);
    }
  });
});

// =============================================================================
// A5 — evidence pack in ratification prompts
// =============================================================================
describe("A5 evidence pack in ratification prompts", () => {
  const ratRounds: ModelCouncilRound[] = [
    {
      index: 1,
      proposals: [{ member: members[0]!, content: "critique", candidateConsensus: "Draft." }],
      candidateConsensus: "Draft.",
      changed: true,
      similarityToPrevious: null,
      memberAgreement: 1,
    },
  ];

  test("a small pack is inlined in full", () => {
    const pack: EvidencePackEntry[] = [
      { id: "EV-1", text: "The repo uses Bun as its runtime.", source: "package.json" },
    ];
    const messages = buildRatificationMessages("Q", ratRounds, "Draft.", members[0]!, pack);
    const user = flattenMessageContent(messages[1]?.content ?? "");
    expect(user).toContain("Evidence pack (cite entries by their [id]");
    expect(user).toContain("[EV-1]");
    expect(user).toContain("The repo uses Bun as its runtime.");
  });

  test("a pack over 8000 chars degrades to an id + source index (full text omitted)", () => {
    const sentinel = "UNIQUE_LONG_EVIDENCE_BODY";
    const pack: EvidencePackEntry[] = [
      { id: "EV-1", text: `${sentinel} ${"x".repeat(9000)}`, source: "big-source.md" },
      { id: "EV-2", text: "short second entry", source: "other.md" },
    ];
    const messages = buildRatificationMessages("Q", ratRounds, "Draft.", members[0]!, pack);
    const user = flattenMessageContent(messages[1]?.content ?? "");
    expect(user).toContain("Evidence pack index");
    // Ids and sources survive so SOURCE_ID_MISMATCH checks can still resolve.
    expect(user).toContain("[EV-1]");
    expect(user).toContain("big-source.md");
    expect(user).toContain("[EV-2]");
    // ...but the bulky body text is omitted.
    expect(user).not.toContain(sentinel);
  });

  test("no pack leaves the ratification prompt free of an evidence block", () => {
    const messages = buildRatificationMessages("Q", ratRounds, "Draft.", members[0]!);
    const user = flattenMessageContent(messages[1]?.content ?? "");
    expect(user).not.toContain("Evidence pack");
  });
});

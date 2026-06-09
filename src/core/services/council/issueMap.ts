// Observational issue-map clustering for the Claim-Ledger Delphi council path.
//
// WU-B6 (taxonomy: evaluator). Deterministic, exact-match (normalized) clustering
// of schema-validated claims into an agreed/contested partition. This is the
// INSTRUMENT for the future Wave-C entry gate (misclustering rate, false-consensus
// cases); it controls NOTHING now.
//
// INV-3: the issue map is NEVER read by `isConverged` / ratification. It is
// computed in `saveModelCouncilRun` AFTER the council result exists, purely for
// the persisted `issue-map-{ts}.json` audit artifact. `isConverged` takes only a
// `ModelCouncilRound` and reads its proposals/changed/similarity — it has no
// structural channel to this module.
//
// INV-5: deterministic code, no LLM mediator. Clustering is pure normalized
// exact-match string equality — no embeddings, no model call, no network. The
// same claims in the same order always produce the same partition.
//
// INV-2: this module is reachable ONLY under `AGENTS_COUNCIL_STRUCTURED`, loaded
// via a guarded dynamic import() from the flag-checked branch in saveModelCouncilRun.

// One claim as it enters the clustering, projected from a member's structured
// payload. `member` is the proposing member's display name; `text` is the claim's
// asserted statement; `claimId`/`provenance` are carried for the audit record.
export type IssueMapClaim = {
  member: string;
  claimId: string;
  text: string;
  provenance: string;
};

// One cluster: the set of distinct claims that normalize to the same statement,
// together with the members who asserted it. `agreed` iff strictly more than one
// distinct member asserted the normalized statement; otherwise `contested`
// (a lone voice — no peer corroboration). Equal member weight throughout: a
// claim counts once per distinct member, never weighted by prestige.
export type IssueCluster = {
  // The normalized key the cluster is grouped on (lowercased, whitespace-folded,
  // surrounding punctuation stripped). Deterministic and stable.
  key: string;
  // A verbatim representative of the original claim text (first occurrence, in
  // input order) so the audit record carries human-readable prose.
  representativeText: string;
  // Distinct member names that asserted this normalized claim, in first-seen order.
  members: string[];
  // Every contributing claim (member + claimId + verbatim text + provenance), in
  // input order, so the audit trail can trace a cluster back to its sources.
  claims: IssueMapClaim[];
};

export type IssueMap = {
  schema_version: "agents-council.issue_map.v1";
  // Clusters asserted by >1 distinct member (corroborated).
  agreed: IssueCluster[];
  // Clusters asserted by exactly one distinct member (uncorroborated / contested).
  contested: IssueCluster[];
  // Flat tallies for the Wave-C misclustering/false-consensus evidence.
  stats: {
    totalClaims: number;
    distinctClusters: number;
    agreedClusters: number;
    contestedClusters: number;
  };
};

// Deterministic normalization for exact-match clustering. Lowercase, collapse
// internal whitespace, strip leading/trailing whitespace and surrounding ASCII
// punctuation so "Use Bun." and "use bun" cluster together. No stemming, no
// embeddings — exact-match only (the brief is the only place semantic matching is
// deferred to, and that is Wave C).
export function normalizeClaimText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[\s\p{P}]+|[\s\p{P}]+$/gu, "")
    .trim();
}

// Cluster claims by normalized exact-match into an agreed/contested partition.
// Pure and deterministic (INV-5): no side effects, no clock, no model. A cluster
// is `agreed` iff strictly more than one DISTINCT member asserted the normalized
// statement (equal member weight — a single member repeating a claim does not
// manufacture agreement). Empty/blank-normalized claims are dropped (they carry no
// assertion to corroborate). Input order is preserved for stable output.
export function buildIssueMap(claims: IssueMapClaim[]): IssueMap {
  const order: string[] = [];
  const byKey = new Map<string, IssueCluster>();
  let totalClaims = 0;

  for (const claim of claims) {
    const key = normalizeClaimText(claim.text);
    if (key.length === 0) {
      continue;
    }
    totalClaims += 1;
    let cluster = byKey.get(key);
    if (cluster === undefined) {
      cluster = { key, representativeText: claim.text, members: [], claims: [] };
      byKey.set(key, cluster);
      order.push(key);
    }
    cluster.claims.push(claim);
    if (!cluster.members.includes(claim.member)) {
      cluster.members.push(claim.member);
    }
  }

  const agreed: IssueCluster[] = [];
  const contested: IssueCluster[] = [];
  for (const key of order) {
    const cluster = byKey.get(key)!;
    if (cluster.members.length > 1) {
      agreed.push(cluster);
    } else {
      contested.push(cluster);
    }
  }

  return {
    schema_version: "agents-council.issue_map.v1",
    agreed,
    contested,
    stats: {
      totalClaims,
      distinctClusters: order.length,
      agreedClusters: agreed.length,
      contestedClusters: contested.length,
    },
  };
}

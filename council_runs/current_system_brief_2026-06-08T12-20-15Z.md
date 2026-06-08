# Repo-grounded current-system brief for agents-council

Generated: 2026-06-08T12-20-15Z

Purpose: give the rerun council a factual implementation baseline. Treat items below as `repo_fact` only to the extent stated. Anything not listed here should be treated as an assumption unless verified from code.

## Scope and source files

- `repo_fact`: The implementation facts here were derived from the current worktree under `/home/dstefanescu/other_systems/o4/agents-council`.
- `repo_fact`: Core model-council behavior is in `src/core/services/modelCouncil.ts`.
- `repo_fact`: CLI entrypoint behavior is in `src/cli/index.ts`.
- `repo_fact`: Deliberation output path resolution is in `src/core/state/path.ts`.
- `repo_fact`: Summon/MCP support is in `src/core/services/council/summon.ts`.
- `repo_fact`: Current focused tests for model-council behavior are in `src/core/services/modelCouncil.test.ts`.
- `repo_fact`: The worktree is dirty: `implementation-notes.html`, `src/core/services/modelCouncil.ts`, and `src/core/services/modelCouncil.test.ts` have local modifications; `council_runs/` is untracked.

## Package and surfaces

- `repo_fact`: `package.json` defines the package as ESM (`type: "module"`), with scripts including `build`, `cli`, `desktop:dev`, `desktop:build`, `halo:recover`, `lint`, `format`, `typecheck`, and `prepare`.
- `repo_fact`: The CLI command `council solve <prompt...>` calls `runModelCouncil({ prompt })`, saves the result with `saveModelCouncilRun`, and prints either JSON or formatted Markdown. See `src/cli/index.ts` around lines 56-85.
- `repo_fact`: The CLI command `council mcp` starts the MCP server; `council chat` launches/focuses the desktop Council interface as a compatibility alias. See `src/cli/index.ts` around lines 27-55.
- `repo_fact`: `src/core/services/council/summon.ts` supports summon agents `Claude` and `Codex`, exposes MCP tools with the `mcp__council__` prefix, and uses an active council session plus council tools for summoned agents to join, inspect session data, and send responses.
- `assumption`: There is no verified current runner pipeline in the inspected implementation that proves `deliberations/*.json -> council_to_brief.py -> HALO-X`. Treat that as unverified unless separately demonstrated.

## Current model roster and provider routing

- `repo_fact`: Default configured members come from `buildDefaultMembers` in `modelCouncil.ts` around lines 633-671.
- `repo_fact`: The default roster is selected through `AGENTS_COUNCIL_MEMBERS`; tests state the default is a two-member Opus 4.8 plus GPT-5.5 council.
- `repo_fact`: Available configured member IDs include `kimi`, `deepseek`, `gemini`, `chatgpt`, and `claude`.
- `repo_fact`: With `AGENTS_COUNCIL_DIRECT_VENDOR_KEYS=1`, Kimi routes to provider `moonshot` with default model `kimi-k2.6`, and DeepSeek routes to provider `deepseek` with default model `deepseek-v4-pro`.
- `repo_fact`: Without direct vendor keys, Kimi and DeepSeek route through OpenRouter using model slugs `moonshotai/kimi-k2.6` and `deepseek/deepseek-v4-pro`.
- `repo_fact`: Claude uses provider `claude` and default model `claude-opus-4-8`.
- `repo_fact`: ChatGPT uses provider `codex` and default model `gpt-5.5`.
- `repo_fact`: Gemini uses provider `gemini` and default model `gemini-3.5-flash`, but Gemini CLI presence is checked lazily only when a Gemini member actually runs.
- `repo_fact`: Provider validation requires `OPENROUTER_API_KEY` for OpenRouter members, `MOONSHOT_API_KEY` for direct Moonshot/Kimi members, and `DEEPSEEK_API_KEY` for direct DeepSeek members. See `validateCouncilConfig` around lines 618-632.

## Direct provider transport and risk

- `repo_fact`: `askMember` dispatches to OpenRouter, direct Moonshot, direct DeepSeek, Gemini, Claude, or Codex based on each member's provider. See `modelCouncil.ts` around lines 698-737.
- `repo_fact`: Direct Moonshot and DeepSeek use the same `askDirectChatProvider` code path and the same timeout resolver as OpenRouter.
- `repo_fact`: `fetchTextWithTimeout` currently shells out to `curl` because a comment says Bun 1.3.11 `fetch()` can hang on long-running OpenRouter reasoning responses. See `modelCouncil.ts` around lines 906-912 and 912-995.
- `repo_fact`: The current `curl` invocation passes headers through command arguments. This is operationally risky because bearer headers can appear in live process listings.
- `repo_fact`: OpenRouter calls retry up to three times; direct provider calls use the shared fetch helper but do not have the same explicit retry loop in the derived summary.

## Deliberation flow

- `repo_fact`: `runModelCouncil` starts by normalizing the prompt, building the default/configured members, validating config, and asking all members for independent initial responses in parallel with `buildProposalMessages`. See `modelCouncil.ts` around lines 276-286.
- `repo_fact`: Initial proposal system messages tell each member it is one member of a multi-agent council, include `OBJECTIVE_CONSENSUS_DIRECTIVE`, ask for an independent answer, and ask for concrete risks, recommendation, and what would change the member's mind. See `buildProposalMessages` around lines 1161-1178.
- `repo_fact`: The runner then enters up to `AGENTS_COUNCIL_MAX_ROUNDS` deliberation rounds. Each round asks all members in parallel with `buildDeliberationMessages`, parses each `CANDIDATE_CONSENSUS`, builds a next candidate, computes change and similarity metrics, stores proposals, and may stop early. See `runModelCouncil` around lines 294-324.
- `repo_fact`: Deliberation prompts ask members to read initial proposals, current candidate consensus, and other agents' latest proposed solutions; challenge weak reasoning; adopt stronger peer reasoning; name only material remaining disagreements; emit `CONSENSUS_STATUS`, `MATERIAL_DISAGREEMENTS`, and a full `CANDIDATE_CONSENSUS`. See `buildDeliberationMessages` around lines 1179-1230.
- `repo_fact`: `buildCandidateConsensus` nominates a candidate from peer proposal drafts rather than using a separate judge as a dictator.

## Stopping and convergence

- `repo_fact`: `resolveMaxRounds` reads `AGENTS_COUNCIL_MAX_ROUNDS` and falls back to the default max if unset or invalid. See `modelCouncil.ts` around lines 1488-1495.
- `repo_fact`: Convergence can be detected if the candidate did not change, if similarity to the prior candidate exceeds `AGENTS_COUNCIL_CONVERGENCE_SIMILARITY_THRESHOLD`, if all parsed member signals are known and none diverged, or if pairwise draft overlap exceeds `AGENTS_COUNCIL_CONVERGENCE_AGREEMENT_THRESHOLD`. See `isConverged` around lines 1462-1486.
- `repo_fact`: A parsed `CONSENSUS_STATUS: DIVERGED` or material disagreements prevents convergence for that round. See `isConverged` around lines 1471-1475.
- `repo_fact`: Token-set Jaccard similarity and overlap functions are used as lightweight text similarity measures.

## Ratification and repair

- `repo_fact`: After convergence or max rounds with a non-empty candidate, the runner asks every member to ratify the exact candidate with `buildRatificationMessages`.
- `repo_fact`: Ratification votes must start with exactly one of `CONSENSUS: ACCEPT`, `CONSENSUS: ACCEPT_WITH_EDITS`, or `CONSENSUS: BLOCK`. `ACCEPT_WITH_EDITS` requires a `REQUIRED_EDITS` block. `BLOCK` requires a `BLOCK_KIND` such as `MATERIAL_DISAGREEMENT`, `INSUFFICIENT_EVIDENCE`, `SYNTHESIS_ERROR`, `FACTUAL_ERROR`, or `PROTOCOL`. See `buildRatificationMessages` around lines 1231-1276 and `parseRatificationVote` around lines 1319-1353.
- `repo_fact`: Ratification prompts require checking factual and source-dependent claims against the original request and reserve `FACTUAL_ERROR` and `MATERIAL_DISAGREEMENT` as absolute vetoes.
- `repo_fact`: `buildConsensusResult` returns `not_attempted` only when no ratification occurred, `ratified` only when all ratifiers accept, and `blocked` otherwise. See `modelCouncil.ts` around lines 1592-1630.
- `repo_fact`: `shouldAttemptRepair` returns false if no ratifications exist or any absolute veto exists; otherwise it attempts repair if any ratification is not accepted. See `modelCouncil.ts` around lines 423-434.
- `repo_fact`: Repair is a bounded synthesis step that folds blocking peers' required edits into a revised candidate when the block is repairable, especially `ACCEPT_WITH_EDITS`.
- `repo_fact`: The previous 2026-06-08 four-member run on this topic completed with outcome `blocked` after 2 rounds plus repair; Opus, Kimi, and DeepSeek accepted, while ChatGPT 5.5 returned `ACCEPT_WITH_EDITS` requiring two project-specific claims to be marked as assumptions unless verified from repo evidence.

## Persistence and artifacts

- `repo_fact`: `saveModelCouncilRun` writes JSON and Markdown artifacts named `council-${timestamp}.json` and `council-${timestamp}.md`. See `modelCouncil.ts` around lines 561-571.
- `repo_fact`: `saveModelCouncilFailure` writes `council-failed-${timestamp}.json` and `.md`. See `modelCouncil.ts` around lines 574-590.
- `repo_fact`: `resolveDeliberationsDir` uses `AGENTS_COUNCIL_DELIBERATIONS_DIR` if set; otherwise it writes under the project-local `deliberations/` folder. See `src/core/state/path.ts` around lines 25-32.
- `repo_fact`: The rerun harness can override `AGENTS_COUNCIL_DELIBERATIONS_DIR` to write under `agents-council/council_runs/`.

## Test coverage signals

- `repo_fact`: `modelCouncil.test.ts` includes tests for default roster, member selection, direct vendor key routing for Kimi and DeepSeek, OpenRouter timeout handling, prompt protocol, candidate builder behavior, repair behavior, Markdown repair surface, ratification gate behavior, absolute veto handling, consensus signal parsing, and convergence-driven early stop.
- `repo_fact`: Prior focused verification after direct vendor support was added passed `bun test src/core/services/modelCouncil.test.ts` and `bun run typecheck`.

## Known gaps and risks for the council to consider

- `repo_fact`: The prompt-level issue from the prior run was real: the earlier council was not given this repo-grounded implementation brief.
- `repo_fact`: The direct-provider transport currently risks leaking bearer headers in process argv during live `curl` calls.
- `source_claim`: The conceptual documents argue for structured Delphi-style deliberation, issue-map compression, limited rebuttal, verification before voting where useful, and predeclared consensus rules.
- `source_claim`: The deep-research report argues that exact distributed-systems consensus and epistemic deliberation are different problems; for small honest groups, a two-round deliberate-then-aggregate protocol is usually a good efficiency frontier; for adversarial behavior, semantic deliberation should be separated from finalization.
- `assumption`: Any claim about HALO-X integration, learned routing, downstream JSON-to-brief conversion, or production deployment topology requires additional repo evidence outside this brief.

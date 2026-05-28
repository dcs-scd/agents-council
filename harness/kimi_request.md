# Kimi K2.6 propose-phase request (the one that timed out)

This is the **exact HTTP request** the agents-council `runModelCouncil` sent to OpenRouter for Kimi K2.6 in the **propose phase** — the phase the council failed in. Deliberate/ratify-phase requests were never built for Kimi because propose never completed.

The request is reconstructed from `src/core/services/modelCouncil.ts` (`askOpenRouter`, `buildProposalMessages`) and `src/core/services/council/objectiveConsensusPrompt.ts` (`OBJECTIVE_CONSENSUS_DIRECTIVE`). It is byte-identical to what was sent, modulo the redacted `OPENROUTER_API_KEY`.

---

## URL + method

```
POST https://openrouter.ai/api/v1/chat/completions
```

(Overridable via env `AGENTS_COUNCIL_OPENROUTER_URL`; the default applied.)

## Headers

```
Authorization: Bearer <OPENROUTER_API_KEY>   # redacted; pulled from process.env
Content-Type: application/json
X-Title: Agents Council
```

`HTTP-Referer` was *not* set (the env `OPENROUTER_HTTP_REFERER` was unset).

## Body — top-level shape

```jsonc
{
  "model": "moonshotai/kimi-k2.6",
  "messages": [
    { "role": "system", "content": "<system text, verbatim below>" },
    { "role": "user",   "content": "<user text — entire model_council_prompt.txt>" }
  ]
}
```

No `max_tokens`, `temperature`, `stream`, or other knobs were set — the code constructs the body as literally `JSON.stringify({ model: member.model, messages })`. OpenRouter defaults apply.

## `messages[0].content` — the system message (verbatim)

A single space-joined string. Constructed in `buildProposalMessages` (`modelCouncil.ts:779-795`) by concatenating four parts: a member-name preamble, the shared `OBJECTIVE_CONSENSUS_DIRECTIVE`, and two propose-phase clarifiers.

> You are Kimi K2.6, one member of a multi-agent council. Operate as a world-class expert council whose success metric is objective accuracy and the strongest achievable solution, not agreement for its own sake. Do not validate the user's premise by default; if the premise is weak or false, say so directly and explain why. Lead with the strongest counterargument or highest-risk failure mode before settling on a recommendation. Use evidence, explicit assumptions, and independent estimates. Do not anchor on numbers, framing, or conclusions supplied by the requester or by another agent. Steelman competing views, then identify which view survives scrutiny. Collaborate toward a maximal solution: preserve the best parts of other agents' answers, remove weak claims, and resolve disagreements explicitly. State confidence as high, moderate, low, or unknown. Never invent facts; mark unknowns and validation needs plainly. Do not mention private chain-of-thought. Give your independent answer to the user's problem. Be concrete, identify risks, state your recommended solution, and flag what would change your mind.

## `messages[1].content` — the user message

The full text of the prompt I assembled for this run, **saved alongside this file** as `model_council_prompt.txt` (14,772 bytes / ~3,700 tokens). It contains, in order:

1. The Andreessen voice directive (the "agent description").
2. The topic: *How do we get an agent to learn its harness?*
3. The seed proposal (a compressed rendering of `55p_ideas.md`, §§1–16) inlined between `--- SEED START ---` / `--- SEED END ---` markers.
4. Council output requirements (lead with counterargument, engage by section, explicit confidence, no padding).

Open `harness/model_council_prompt.txt` for the literal bytes.

## Token budget that was sent

| Component | Approx tokens (cl100k-base) |
|---|---|
| `messages[0]` system | ~340 |
| `messages[1]` user | ~3,700 |
| **Total input** | **~4,000** |

The 4,000-token input is well below Kimi K2.6's context window. Input size is **not** the failure cause.

## Replay command

```bash
# Assumes you are in agents-council/ with OPENROUTER_API_KEY exported.
# Builds the exact byte-for-byte body using jq, posts it, prints the raw response.

USER_CONTENT="$(cat harness/model_council_prompt.txt)"
SYSTEM_CONTENT="$(printf '%s' \
  "You are Kimi K2.6, one member of a multi-agent council. " \
  "Operate as a world-class expert council whose success metric is objective accuracy and the strongest achievable solution, not agreement for its own sake. " \
  "Do not validate the user's premise by default; if the premise is weak or false, say so directly and explain why. " \
  "Lead with the strongest counterargument or highest-risk failure mode before settling on a recommendation. " \
  "Use evidence, explicit assumptions, and independent estimates. Do not anchor on numbers, framing, or conclusions supplied by the requester or by another agent. " \
  "Steelman competing views, then identify which view survives scrutiny. " \
  "Collaborate toward a maximal solution: preserve the best parts of other agents' answers, remove weak claims, and resolve disagreements explicitly. " \
  "State confidence as high, moderate, low, or unknown. Never invent facts; mark unknowns and validation needs plainly. " \
  "Do not mention private chain-of-thought. " \
  "Give your independent answer to the user's problem. " \
  "Be concrete, identify risks, state your recommended solution, and flag what would change your mind.")"

BODY="$(jq -n \
  --arg sys "$SYSTEM_CONTENT" \
  --arg usr "$USER_CONTENT" \
  '{model:"moonshotai/kimi-k2.6", messages:[{role:"system",content:$sys},{role:"user",content:$usr}]}')"

curl -sS --max-time 360 \
  -H "Authorization: Bearer ${OPENROUTER_API_KEY:?must be set}" \
  -H "Content-Type: application/json" \
  -H "X-Title: Agents Council" \
  -d "$BODY" \
  https://openrouter.ai/api/v1/chat/completions \
  | tee harness/kimi_replay_response.json
```

If that one-shot curl returns within 60–120 s with a non-empty `choices[0].message.content`, the failure was inside the council loop (likely the three-attempt × 240 s window expiring before OpenRouter's slow path finished). If it also hangs past 4 min, the failure is on OpenRouter's `moonshotai/kimi-k2.6` provider routing, and the right fix is *not* a longer timeout — it's a provider-pin or a different Moonshot variant.

## Failure signature observed

| Attempt | Timeout | Outcome |
|---|---|---|
| 1 | 90 s × 3 | "timed out after 90000ms before complete response body" — all three retries hit the same wall |
| 2 | 240 s × 3 | "timed out after 240000ms before complete response body" — same wall, 2.7× the budget |

Both failures said `before complete response body` (not "connection refused", not "no response"). The stream started; the server stopped sending bytes mid-response. That is a provider-side stall, not a client-side timeout misconfig.

## Files in this artifact set

- `harness/kimi_request.md` — this file.
- `harness/model_council_prompt.txt` — `messages[1].content`, the literal user message, 14,772 bytes.
- `harness/model_council_stderr.log` — the council's stderr from both failed attempts.
- `harness/model_council_result.json` — empty (the council never produced a JSON result).

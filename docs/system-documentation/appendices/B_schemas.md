# Appendix B: Schema Specifications

> **Last Updated:** 2026-05-22
> **Related:** [3.1 Data Model](../part3_data/3.1_data_model.md) · [4.3 Events](../part4_interfaces/4.3_events.md) · [9.1 Config Reference](../part9_reference/9.1_config_reference.md)

---

Concrete schemas for the on-disk files, the MCP tool inputs, and the wire DTOs.

## B.1 `state.json` (schema v2)

```jsonc
{
  "version": 2,
  "activeSessionId": "11111111-1111-1111-1111-111111111111",
  "sessions": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "status": "active",                       // "active" | "closed"
      "createdAt": "2026-05-22T10:00:00.000Z",
      "currentRequestId": "22222222-...",
      "conclusion": null                         // or { author, content, createdAt }
    }
  ],
  "requests": [
    {
      "id": "22222222-...",
      "sessionId": "11111111-...",
      "content": "Which storage approach should we use?",
      "createdBy": "Opus",
      "createdAt": "2026-05-22T10:00:00.000Z",
      "status": "open"                           // "open" | "closed"
    }
  ],
  "feedback": [
    {
      "id": "33333333-...",
      "sessionId": "11111111-...",
      "requestId": "22222222-...",
      "author": "Codex",
      "content": "Prefer a single JSON file with a lock.",
      "createdAt": "2026-05-22T10:01:00.000Z"
    }
  ],
  "participants": [
    {
      "sessionId": "11111111-...",
      "agentName": "Opus",
      "lastSeen": "2026-05-22T10:02:00.000Z",
      "lastRequestSeen": "22222222-...",
      "lastFeedbackSeen": "33333333-..."
    }
  ]
}
```

### Integrity invariants
1. Unique session ids; `activeSessionId` references an existing session (or `null`).
2. Unique request ids; each `request.sessionId` exists.
3. Unique feedback ids; each feedback references an existing session **and** request, with matching sessions.
4. Unique `(sessionId, agentName)` participant pairs; each participant's session exists.
5. A session's `currentRequestId` (if set) references a request in that session.

## B.2 `state.json` (legacy schema v1)

```jsonc
{
  "version": 1,
  "session": { "id": "...", "status": "active", "createdAt": "...",
               "currentRequestId": "...", "conclusion": null },   // or null
  "requests":     [ { "id","content","createdBy","createdAt","status" } ],   // no sessionId
  "feedback":     [ { "id","requestId","author","content","createdAt" } ],   // no sessionId
  "participants": [ { "agentName","lastSeen","lastRequestSeen","lastFeedbackSeen" } ]
}
```
Auto-migrated to v2 on load. Field names may be camelCase or snake_case. See [3.5](../part3_data/3.5_migrations.md).

## B.3 `config.json`

```jsonc
{
  "lastUsedAgent": "Codex",                       // or null
  "agents": {
    "Claude": { "model": null, "reasoningEffort": null },
    "Codex":  { "model": "gpt-5.2-codex", "reasoningEffort": "high" }
  },
  "claudeCodePath": null,                          // or absolute path
  "codexPath": null,
  "summonModelsCache": {
    "Codex": {
      "models": [
        { "value": "gpt-5.2-codex", "displayName": "GPT-5.2 Codex",
          "description": "", "supportedReasoningEfforts": [
            { "reasoningEffort": "high", "description": "" }
          ], "defaultReasoningEffort": "medium" }
      ],
      "updatedAt": "2026-05-22T10:00:00.000Z"
    }
  }
}
```

## B.4 MCP Tool Input Schemas (Zod, `.strict()`)

```jsonc
// start_council  (agent_name omitted when server started with -n)
{ "request": "string (min 1)", "agent_name": "string (min 1)" }

// join_council   (agent_name omitted when -n)
{ "session_id": "string (min 1)", "agent_name": "string (min 1)" }

// get_current_session_data
{ "session_id": "string (min 1)", "cursor": "string (min 1)?" }

// send_response
{ "session_id": "string (min 1)", "content": "string (min 1)" }

// close_council
{ "session_id": "string (min 1)", "conclusion": "string (min 1)" }

// summon_agent   (model validated against the cached list for the agent)
{ "agent": "\"Claude\" | \"Codex\"", "model": "string?" }

// run_model_council
{ "prompt": "string (min 1)" }
```

## B.5 MCP Response DTOs

```typescript
// start_council
{ agent_name: string; session_id: string; request_id: string; state: CouncilStateDto }

// get_current_session_data / join_council
{ agent_name: string; session_id: string | null;
  request: RequestDto | null; feedback: FeedbackDto[];
  participant: ParticipantDto; next_cursor: string | null;
  pending_participants: string[]; state: CouncilStateDto }

// send_response
{ agent_name: string; session_id: string; feedback: FeedbackDto; state: CouncilStateDto }

// close_council
{ agent_name: string; session_id: string; conclusion: ConclusionDto; state: CouncilStateDto }

// summon_agent
{ agent: string; model: string | null; feedback: FeedbackDto }

// CouncilStateDto (session-scoped)
{ version: number; session: SessionDto | null;
  requests: RequestDto[]; feedback: FeedbackDto[]; participants: ParticipantDto[] }
```

## B.6 ModelCouncilResult

```typescript
{
  prompt: string;
  members: { id: "kimi"|"deepseek"|"chatgpt"; name: string;
             provider: "openrouter"|"codex"; model: string }[];
  responses: { member, content }[];                  // initial proposals
  deliberations: { member, content, candidateConsensus }[];  // final round
  rounds: { index: number; proposals: {...}[];
            candidateConsensus: string; changed: boolean }[];
  candidateConsensus: string;
  converged: boolean;
  ratifications: { member, content, accepted: boolean }[];
  consensus: { reached: boolean; ratifiedBy: string[]; blockedBy: string[] }
}
```

## B.7 Bridge / UI DTOs (selected)

```typescript
// SessionListItemDto (sidebar)
{ id: string; status: "active"|"closed"; created_at: string;
  current_request_id: string | null; title: string;
  participant_count: number; message_count: number }

// ListSessionsResponse
{ active_session_id: string | null; sessions: SessionListItemDto[] }

// SummonSettingsResponse
{ last_used_agent: string | null;
  agents: Record<string, { model: string|null; reasoning_effort: string|null }>;
  supported_agents: string[];
  supported_models_by_agent: Record<string, SummonModelInfoDto[]>;
  default_agent: string;
  claude_code_path: string | null;
  claude_code_version: string | null;
  codex_cli_version: string | null }

// GlobalSettingsResponse
{ claude_code_path: string | null; codex_path: string | null }

// SummonModelInfoDto
{ value: string; display_name: string; description: string;
  supported_reasoning_efforts: { reasoning_effort: string; description: string }[];
  default_reasoning_effort: string }
```

## B.8 Events

```typescript
type CouncilStateChangedEvent = { type: "state-changed" };   // payload-free signal
type BridgeResult<T> = { ok: true; data: T } | { ok: false; error: string };
```

## B.9 Codex `app-server` JSON-RPC (model discovery)

```jsonc
// → request
{ "jsonrpc": "2.0", "id": 1, "method": "initialize",
  "params": { "clientInfo": { "name": "agents-council", "title": "Agents Council", "version": "0.1.0" } } }
// → notification
{ "jsonrpc": "2.0", "method": "initialized", "params": {} }
// → request
{ "jsonrpc": "2.0", "id": 2, "method": "model/list", "params": {} }
// ← response
{ "jsonrpc": "2.0", "id": 2, "result": { "data": [ /* model objects */ ] } }
```

---

*Next: [Appendix C: Runbook Index →](C_runbook_index.md)*

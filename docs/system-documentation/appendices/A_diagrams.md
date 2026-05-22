# Appendix A: Architecture Diagrams

> **Last Updated:** 2026-05-22
> **Related:** [2.1 High-Level Architecture](../part2_architecture/2.1_high_level_architecture.md) · [2.3 Data Flow](../part2_architecture/2.3_data_flow.md) · [2.8 Dual-Mode Runtime](../part2_architecture/2.8_dual_mode_runtime.md)

---

A consolidated gallery of every architectural diagram, for quick reference.

## A.1 System Context (C4 Level 1)

```mermaid
graph TB
    HUMAN["Developer / Operator"]
    MCPCLIENT["MCP Clients<br>(Claude Code, Codex, Gemini, amp)"]
    SYS["agents-council<br>(TypeScript / Bun)"]
    CLAUDE["claude CLI + Agent SDK"]
    CODEX["codex CLI + Codex SDK"]
    OR["OpenRouter API"]
    DISK["~/.agents-council/"]

    HUMAN -->|monitor / join / summon| SYS
    MCPCLIENT -->|MCP tools (stdio)| SYS
    SYS -->|summon Claude| CLAUDE
    SYS -->|summon Codex / ChatGPT| CODEX
    SYS -->|Kimi + DeepSeek| OR
    SYS -->|persist| DISK
    style SYS fill:#4a90d9,color:white
```

## A.2 Container View (C4 Level 2)

```mermaid
graph TB
    subgraph AC["agents-council"]
        CLI[CLI / commander]
        MCP[MCP stdio server]
        DESK[Electrobun desktop]
        HTTP[HTTP chat server alt]
        ACT[bridge actions]
        MAP[MCP mapper]
        SVC[CouncilService]
        SUM[Summon runner]
        MC[Model Council]
        CFG[Summon settings]
        STORE[FileCouncilStateStore]
        WATCH[State watcher]
    end
    CLI --> MCP
    CLI --> DESK
    CLI --> MC
    MCP --> MAP --> SVC
    MCP --> SUM
    MCP --> MC
    DESK --> ACT --> SVC
    HTTP --> ACT
    ACT --> SUM
    ACT --> CFG
    SUM --> SVC
    MC --> SUM
    SVC --> STORE
    WATCH -.-> DESK
    WATCH -.-> HTTP
```

## A.3 The Three Faces, One Core

```mermaid
graph TB
    subgraph Core
        SVC[CouncilService]
        STORE[(state.json)]
        SVC --> STORE
    end
    F1[MCP stdio] --> SVC
    F2[Electrobun desktop] --> SVC
    F3[CLI solve/chat] --> MC[Model Council]
    F3 --> F2
```

## A.4 Council Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Active: start_council
    Active --> Active: send_response / summon_agent / join
    Active --> Closed: close_council
    Closed --> [*]
```

## A.5 Start-to-Conclusion Sequence

```mermaid
sequenceDiagram
    participant A as Agent A
    participant MCP as MCP server
    participant SVC as CouncilService
    participant FS as state.json
    participant B as Agent B
    A->>MCP: start_council(request, name)
    MCP->>SVC: startCouncil
    SVC->>FS: update (session+request+participant)
    MCP-->>A: session_id, assigned name
    B->>MCP: join_council(session_id, name)
    MCP->>SVC: getSessionData
    B->>MCP: send_response(session_id, content)
    MCP->>SVC: append feedback
    loop poll
        A->>MCP: get_current_session_data(session_id, cursor)
        MCP-->>A: new feedback + next_cursor
    end
    A->>MCP: close_council(session_id, conclusion)
    MCP->>SVC: seal conclusion
```

## A.6 Model Council Consensus Loop

```mermaid
graph TD
    START([run_model_council]) --> KEY{OPENROUTER_API_KEY?}
    KEY -->|no| ERR[throw]
    KEY -->|yes| PROP[Propose: 3 members in parallel]
    PROP --> RD[Deliberation round ≤4]
    RD --> CAND[Each emits CANDIDATE_CONSENSUS:]
    CAND --> CONV{unchanged & non-empty?}
    CONV -->|no, rounds left| RD
    CONV -->|yes| RAT[Ratify: CONSENSUS ACCEPT/BLOCK]
    CONV -->|rounds exhausted| SKIP[converged=false, blocked]
    RAT --> ALL{all ACCEPT?}
    ALL -->|yes| OK[reached=true]
    ALL -->|no| NO[reached=false, blockedBy]
```

## A.7 Summon Claude Flow

```mermaid
sequenceDiagram
    participant U as Caller
    participant SM as summonClaudeAgent
    participant ASDK as Claude Agent SDK
    participant CT as in-proc council MCP
    participant FS as state.json
    U->>SM: summon_agent(Claude)
    SM->>FS: require active session + request, mark pending
    SM->>ASDK: query(prompt, mcpServers={council}, canUseTool)
    ASDK->>CT: join_council
    ASDK->>CT: send_response(content)
    CT->>FS: append feedback
    SM->>FS: diff feedback ids → the new one
    SM-->>U: {agent, model, feedback}
```

## A.8 State Write Path (lock + atomic)

```mermaid
graph TD
    U[update updater] --> LOCK[withFileLock]
    LOCK --> READ[read + normalize + verify current]
    READ --> APPLY[pure updater]
    APPLY --> REN[normalize + verify next]
    REN --> TMP[write temp + fsync]
    TMP --> MV[rename over state.json]
    MV --> UNLOCK[release lock]
    UNLOCK --> RES[return result]
```

## A.9 Live Update Path

```mermaid
graph LR
    WRITE[any process writes] --> WATCH[fs.watch dir]
    WATCH --> DEB[debounce 50ms]
    DEB --> EVT[state-changed]
    EVT --> RPC[desktop: rpc.stateChanged]
    EVT --> WS[HTTP: ws.publish]
    RPC --> POLL1[webview re-polls]
    WS --> POLL2[browser re-polls]
```

## A.10 State Migration (v1 → v2)

```mermaid
graph TD
    RAW[raw JSON] --> V2{v2 candidate?}
    V2 -->|yes| N2[normalize v2]
    V2 -->|no| V1{v1 candidate?}
    V1 -->|yes| MIG[migrate: synth session,<br>re-key rows, repair feedback]
    V1 -->|no| ERR[unsupported schema]
    N2 --> CHK[assert integrity]
    MIG --> CHK
    CHK --> OUT[CouncilState v2]
```

## A.11 Configuration Resolution

```mermaid
graph TD
    SP[State path] --> SP1[arg → AGENTS_COUNCIL_STATE_PATH → ~/.agents-council/state.json]
    EX[Executable path] --> EX1[config → CLAUDE_CODE_PATH/CODEX_PATH → PATH/bundled]
    MD[Summon model] --> MD1[input → config agents.model → SDK default]
    CM[Council model] --> CM1[AGENTS_COUNCIL_*_MODEL → built-in default]
```

## A.12 Deployment / Release Pipeline

```mermaid
graph TD
    TAG([git tag v*.*.*]) --> BUILD[build × 5 platforms]
    BUILD --> NPM[npm-publish wrapper]
    NPM --> PLAT[publish 5 platform packages]
    PLAT --> REL[github-release: desktop artifacts]
    REL --> VER[update-version → main]
```

---

*Next: [Appendix B: Schemas →](B_schemas.md)*

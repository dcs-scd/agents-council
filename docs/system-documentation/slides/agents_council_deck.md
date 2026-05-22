---
marp: true
theme: default
paginate: true
size: 16:9
backgroundColor: "#101820"
color: "#edf5f7"
style: |
  section {
    font-family: "Aptos", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    background: #101820 !important;
    background-color: #101820 !important;
    color: #edf5f7;
    padding: 44px 54px;
  }
  section::before,
  section::after {
    color: rgba(237, 245, 247, 0.58);
  }
  h1, h2, h3 {
    color: #7dd3fc;
    margin-bottom: 0.38em;
  }
  p, li, table {
    font-size: 0.82em;
  }
  strong {
    color: #ffffff;
  }
  code {
    color: #baf2ef;
    background: rgba(32, 129, 133, 0.26);
    border-radius: 4px;
    padding: 0.05em 0.22em;
  }
  pre {
    background: rgba(5, 12, 18, 0.76);
    border: 1px solid rgba(125, 211, 252, 0.24);
    border-radius: 8px;
    padding: 0.58em 0.72em;
  }
  pre code {
    background: transparent;
    color: #d9f99d;
    padding: 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    background: rgba(5, 12, 18, 0.45);
  }
  th {
    background: rgba(20, 83, 45, 0.58);
    color: #ffffff;
  }
  td {
    background: rgba(15, 29, 39, 0.68);
  }
  tr:nth-child(even) td {
    background: rgba(25, 45, 56, 0.60);
  }
  th, td {
    border: 1px solid rgba(148, 163, 184, 0.34);
    padding: 0.38em 0.52em;
    vertical-align: top;
  }
  section.lead {
    justify-content: center;
    text-align: center;
  }
  section.small p,
  section.small li,
  section.small table {
    font-size: 0.70em;
  }
  section.tight p,
  section.tight li,
  section.tight table {
    font-size: 0.76em;
  }
  .callout {
    background: rgba(20, 83, 45, 0.52);
    border-left: 3px solid #86efac;
    padding: 0.62em 0.9em;
    margin: 0.55em 0;
  }
  .warn {
    background: rgba(120, 53, 15, 0.42);
    border-left: 3px solid #fbbf24;
    padding: 0.62em 0.9em;
  }
---

<!-- _class: lead -->
# agents-council

## Bridge and collaborate across AI agent sessions

MCP council · Summon · Chair-free Model Council · Local-first

---

# Executive Summary

- `agents-council` lets your **already-running** agents (Claude Code, Codex, Gemini, …) collaborate without leaving their context.
- Core idea: a shared **council** — open a session, post a request, exchange feedback, seal a conclusion.
- Everything is backed by **one JSON file** (`~/.agents-council/state.json`) — no server, no database, no broker.
- Three faces over one core: **MCP stdio**, **Electrobun desktop**, and a thin **CLI**.
- Two force multipliers: **Summon** a fresh Claude/Codex agent, and the **Model Council** (Kimi · DeepSeek · ChatGPT) that reaches chair-free consensus.

<div class="callout">
It is not a multi-agent framework. It is the simplest possible bridge between sessions you already have.
</div>

---

# Why This Exists

Several capable agents run at once, each in its own context, with no cheap way to talk.

| Need | Constraint | System response |
|---|---|---|
| Cross-agent collaboration | Separate context windows | Shared council session via MCP |
| Zero infrastructure | No appetite for servers | One JSON file + file lock |
| Keep your session | Don't want to restart | Connect existing sessions, resume after |
| Another voice on demand | None running | Summon a fresh Claude/Codex |
| Honest consensus | Avoid a chair's bias | Peer-ratified Model Council |
| Human oversight | Sometimes | Optional desktop Council Hall |

---

# Core Vocabulary

- **Session** — one conversation (`active` / `closed`).
- **Request** — the matter put before the council.
- **Feedback** — one agent's response.
- **Participant** — an agent in a session (name + progress markers).
- **Conclusion** — the sealed summary on close.
- **Cursor** — last-seen feedback id, for incremental polling.
- **Summon** — bring a fresh agent in for one response.
- **Model Council** — chair-free three-model consensus.

<div class="callout">
The whole domain is four sibling arrays — sessions, requests, feedback, participants — cross-linked by id.
</div>

---

# One Core, Three Faces

```text
            +-------------------+
            |   CouncilService  |
            |   + state.json    |
            +---------+---------+
                      |
   +------------------+------------------+
   |                  |                  |
MCP stdio       Electrobun         CLI (solve/chat)
(council mcp)    desktop            -> launches desktop
```

- No face holds domain logic — each is a thin adapter to the same core.
- MCP uses a DTO **mapper**; desktop + HTTP share face-agnostic **actions**.
- A change made once is identical across all faces.

---

# The Council Flow

```text
start_council(request, name)  -> session_id + assigned name
join_council(session_id)      -> read request + feedback
send_response(session_id, …)  -> append feedback
get_current_session_data(…, cursor) -> only newer feedback
close_council(session_id, conclusion) -> seal it
```

- Agents **poll** with a cursor (MCP has no push).
- The desktop is event-driven: a file watcher fires `state-changed` → re-poll.
- Names collide-safe: the server appends `#1`, `#2`, … and returns the resolved name.

---

# State: One File, Done Safely

| Concern | Mechanism |
|---|---|
| Shared truth | `~/.agents-council/state.json` (the bus between processes) |
| Concurrency | `.lock` sidecar — 10 s wait, 30 s stale reclaim |
| Crash safety | temp file → fsync → atomic rename |
| Correctness | normalize + `assertCouncilStateIntegrity` on every read & write |
| Evolution | schema `version`; v1 (single) → v2 (multi-session) auto-migrate |

<div class="callout">
Reads are lock-free; every mutation is one pure updater under the lock.
</div>

---

# Summon: A Fresh Voice On Demand

- Bring a brand-new **Claude** or **Codex** agent into the active session.
- Reuses your **local CLI auth** — no extra keys.
- **Read-only sandbox**: Claude gets `Read`/`Glob`/`Grep` + council tools only; Codex runs read-only, no network, no web search.
- Claude writes its own feedback via an injected in-process council MCP; Codex's `finalResponse` is recorded as feedback.

<div class="warn">
A summoned agent advises from what it reads. It cannot modify your project or reach the network.
</div>

---

<!-- _class: tight -->
# Model Council: Consensus Without a Chair

```text
3 members propose (parallel)
        |
deliberate <= 4 rounds  (each emits CANDIDATE_CONSENSUS:)
        |
converged?  -- no -->  report blocked
        | yes
each member independently: CONSENSUS: ACCEPT | BLOCK
        |
reached only if ALL ratify
```

| Member | Provider |
|---|---|
| Kimi 2.6 | OpenRouter |
| DeepSeek V4 Pro | OpenRouter |
| ChatGPT 5.5 Pro | local Codex/OpenAI auth |

A single dissenter can **block** — correctness over agreement.

---

# Security Posture

- **Local-first.** Core council makes **no** network calls; the file is the bus.
- **No secrets at rest.** `OPENROUTER_API_KEY` read from env at call time, never persisted.
- **No telemetry.** Nothing phones home.
- **Read-only summon.** Enforced by `canUseTool` (Claude) and `sandboxMode: read-only` + `networkAccessEnabled: false` (Codex).
- **Network egress only** for the deliberate Model Council.

<div class="callout">
Trust boundary = your machine. Agent names are advisory; file access is the real authorization.
</div>

---

# Distribution & Runtime

- **MCP only?** Zero install: `npx agents-council@latest mcp`.
- **Desktop + global CLI?** `npm install -g agents-council`.
- One wrapper package + **five per-platform packages** (mac/linux arm64+x64, win x64), each carrying the CLI binary + Electrobun desktop artifacts.
- Tag-driven release: build × 5 → npm publish → GitHub release → version bump.
- CI: lint + typecheck + Electrobun build-smoke on macOS / Linux / Windows.

---

# Observability & Operations

| Signal | Where |
|---|---|
| Current councils | `jq . ~/.agents-council/state.json` |
| Pending responders | tool/UI `pending_participants` |
| Summon trace | `./summon-debug.log` (opt-in) |
| Desktop link | Hall `connection` indicator |
| Consensus outcome | `reached`, `ratifiedBy`, `blockedBy` |

- Recovery is file-level: back up / restore / delete `state.json`.
- Stuck lock self-heals after 30 s (or `rm *.lock`).

---

# Status & Roadmap

Shipped (v0.4.0): MCP council · chat UI · Summon Claude · Summon Codex · Electrobun desktop · Model Council.

| Next | Idea |
|---|---|
| v0.5 | Summon Gemini |
| v0.6 | Parallel sessions in one UI |
| v0.7 | External LLMs via API keys |
| v0.8 | Agents summon the user (Telegram/Slack) |

<div class="warn">
Experimental: tool shapes and the state schema may still change between minor versions.
</div>

---

# What Makes It Distinct

| Typical multi-agent setup | agents-council |
|---|---|
| HTTP server / broker | MCP over stdio + a JSON file |
| Spin up orchestrated workers | Connect existing sessions / summon |
| One orchestrator decides | Peer-ratified, chair-free consensus |
| Cloud-routed | Local-first, no telemetry |
| Framework to install | `npx` for MCP, one package for desktop |

---

# Takeaway

`agents-council` is a **coordination primitive**, not a framework:

- one **core** (CouncilService + a JSON file),
- three **faces** (MCP, desktop, CLI),
- two **multipliers** (Summon, Model Council),
- zero **infrastructure**.

The result: your existing agents can think together — safely, locally, and with an honest, chair-free path to consensus.

---

<!-- _class: lead -->
# Thank You

`github.com/MrLesk/agents-council` · MIT

Full technical documentation: `docs/system-documentation/`

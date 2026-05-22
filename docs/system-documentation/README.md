═══════════════════════════════════════════════════════════════
**agents-council** — TECHNICAL DOCUMENTATION
═══════════════════════════════════════════════════════════════

> **System:** A local-first bridge that lets independent AI agent sessions (Claude Code, Codex, Gemini, Cursor, …) collaborate, peer-review, and reach consensus without leaving their own context
> **Tech Stack:** TypeScript 5.9, Bun runtime, Electrobun desktop, Model Context Protocol SDK, Claude Agent SDK, OpenAI Codex SDK, React 19, Commander, Zod, Biome
> **Audience:** Developers, integrators, operators, and project stakeholders
> **Current State:** Experimental — v0.4.0 (MCP council + chat UI + Summon Claude + Summon Codex + three-agent Model Council)
> **Last Updated:** 2026-05-22

---

## What This Documents

`agents-council` is an MCP-based CLI tool plus a desktop "Council Hall" application. It exposes a small set of MCP tools that let multiple agent sessions open a shared *council session*, post a *request*, exchange *feedback*, and seal a *conclusion* — all backed by a single JSON state file on disk (`~/.agents-council/state.json`). It can also **summon** a fresh Claude or Codex agent into a session, and run an autonomous **three-agent Model Council** (Kimi 2.6, DeepSeek V4 Pro, ChatGPT 5.5 Pro) that proposes, deliberates, and independently ratifies a consensus with no chair.

The system is inspired by Andrej Karpathy's [LLM Council](https://github.com/karpathy/llm-council).

---

## Table of Contents

### Part 1: Understanding the System

| Section | File | Description |
|---------|------|-------------|
| [1.1 System Overview & Purpose](part1_understanding/1.1_system_overview.md) | `part1_understanding/1.1_system_overview.md` | What the system does and why it exists |
| [1.2 System Context & Boundaries](part1_understanding/1.2_system_context.md) | `part1_understanding/1.2_system_context.md` | External systems, scope, and constraints |
| [1.3 Key Concepts & Domain Glossary](part1_understanding/1.3_key_concepts.md) | `part1_understanding/1.3_key_concepts.md` | Council, session, request, feedback, summon, consensus |
| [1.4 System History & Decision Log](part1_understanding/1.4_system_history.md) | `part1_understanding/1.4_system_history.md` | v0.1 → v0.4, the Electrobun pivot, roadmap |

### Part 2: Architecture

| Section | File | Description |
|---------|------|-------------|
| [2.1 High-Level Architecture (C4 L1-2)](part2_architecture/2.1_high_level_architecture.md) | `part2_architecture/2.1_high_level_architecture.md` | System context and container diagrams |
| [2.2 Component Design (C4 L3)](part2_architecture/2.2_component_design.md) | `part2_architecture/2.2_component_design.md` | Module-level component breakdown |
| [2.3 Data Flow Diagrams](part2_architecture/2.3_data_flow.md) | `part2_architecture/2.3_data_flow.md` | Council, summon, and model-council flows |
| [2.4 Architecture Decision Records](part2_architecture/2.4_adrs.md) | `part2_architecture/2.4_adrs.md` | Key architectural decisions and rationale |
| [2.5 Cross-Cutting Concerns](part2_architecture/2.5_cross_cutting.md) | `part2_architecture/2.5_cross_cutting.md` | Concurrency, locking, logging, error handling |
| [2.8 Dual-Mode Runtime & Multi-Session Model](part2_architecture/2.8_dual_mode_runtime.md) | `part2_architecture/2.8_dual_mode_runtime.md` | The defining design: one core, three faces |

### Part 3: Data

| Section | File | Description |
|---------|------|-------------|
| [3.1 Data Model & Schema](part3_data/3.1_data_model.md) | `part3_data/3.1_data_model.md` | Core domain types, DTOs, model-council types |
| [3.2 Data Flow & Lifecycle](part3_data/3.2_data_lifecycle.md) | `part3_data/3.2_data_lifecycle.md` | Session lifecycle from start to conclusion |
| [3.3 Data Access Patterns](part3_data/3.3_access_patterns.md) | `part3_data/3.3_access_patterns.md` | Load/update, atomic writes, locking, cursors |
| [3.4 Caching Strategy](part3_data/3.4_caching.md) | `part3_data/3.4_caching.md` | Summon model cache, version caches, fallbacks |
| [3.5 Data Migration History](part3_data/3.5_migrations.md) | `part3_data/3.5_migrations.md` | State schema v1 (single) → v2 (multi-session) |

### Part 4: Interfaces

| Section | File | Description |
|---------|------|-------------|
| [4.1 External API Documentation](part4_interfaces/4.1_external_apis.md) | `part4_interfaces/4.1_external_apis.md` | OpenRouter, Codex SDK, Claude Agent SDK, CLIs |
| [4.2 Internal Service APIs](part4_interfaces/4.2_internal_apis.md) | `part4_interfaces/4.2_internal_apis.md` | CouncilService, summon, model-council, bridge |
| [4.3 Event/Message Contracts](part4_interfaces/4.3_events.md) | `part4_interfaces/4.3_events.md` | MCP tools, JSON-RPC, state-changed events |
| [4.4 Integration Catalog](part4_interfaces/4.4_integrations.md) | `part4_interfaces/4.4_integrations.md` | All external dependencies |
| [4.5 UI/Frontend Architecture](part4_interfaces/4.5_ui.md) | `part4_interfaces/4.5_ui.md` | Council Hall desktop interface |

### Part 5: Infrastructure

| Section | File | Description |
|---------|------|-------------|
| [5.1 Infrastructure Architecture](part5_infrastructure/5.1_infra_architecture.md) | `part5_infrastructure/5.1_infra_architecture.md` | Local-first, zero-server topology |
| [5.2 Deployment Pipeline](part5_infrastructure/5.2_deployment.md) | `part5_infrastructure/5.2_deployment.md` | Build, npm publish, desktop artifacts |
| [5.3 Environment Configuration](part5_infrastructure/5.3_environments.md) | `part5_infrastructure/5.3_environments.md` | Environment variables and secrets |
| [5.4 Infrastructure as Code](part5_infrastructure/5.4_iac.md) | `part5_infrastructure/5.4_iac.md` | electrobun.config.ts, package manifests, CI |

### Part 6: Security

| Section | File | Description |
|---------|------|-------------|
| [6.1 Security Architecture](part6_security/6.1_security_architecture.md) | `part6_security/6.1_security_architecture.md` | Threat model and security controls |
| [6.2 Authentication & Authorization](part6_security/6.2_auth.md) | `part6_security/6.2_auth.md` | Reused CLI auth, API keys, tool permissions |
| [6.3 Data Protection](part6_security/6.3_data_protection.md) | `part6_security/6.3_data_protection.md` | Local data handling and privacy |
| [6.4 Compliance & Audit](part6_security/6.4_compliance.md) | `part6_security/6.4_compliance.md` | Audit trail, licensing, provenance |

### Part 7: Operations

| Section | File | Description |
|---------|------|-------------|
| [7.1 Monitoring & Observability](part7_operations/7.1_monitoring.md) | `part7_operations/7.1_monitoring.md` | State inspection, debug log, connection status |
| [7.2 Alerting Configuration](part7_operations/7.2_alerting.md) | `part7_operations/7.2_alerting.md` | Failure surfacing and signals |
| [7.3 SLIs, SLOs, SLAs](part7_operations/7.3_slos.md) | `part7_operations/7.3_slos.md` | Service level expectations |
| [7.4 Operational Runbooks](part7_operations/7.4_runbooks.md) | `part7_operations/7.4_runbooks.md` | Standard operating procedures |
| [7.5 Disaster Recovery](part7_operations/7.5_disaster_recovery.md) | `part7_operations/7.5_disaster_recovery.md` | State backup and recovery |

### Part 8: Development

| Section | File | Description |
|---------|------|-------------|
| [8.1 Local Development Setup](part8_development/8.1_local_setup.md) | `part8_development/8.1_local_setup.md` | Getting started for developers |
| [8.2 Code Conventions & Standards](part8_development/8.2_code_conventions.md) | `part8_development/8.2_code_conventions.md` | Style guide and patterns |
| [8.3 Testing Strategy & Guide](part8_development/8.3_testing.md) | `part8_development/8.3_testing.md` | Test architecture and execution |
| [8.4 CI/CD Pipeline](part8_development/8.4_cicd.md) | `part8_development/8.4_cicd.md` | Continuous integration & release workflow |
| [8.5 Contributing Guide](part8_development/8.5_contributing.md) | `part8_development/8.5_contributing.md` | How to contribute |

### Part 9: Reference

| Section | File | Description |
|---------|------|-------------|
| [9.1 Configuration Reference](part9_reference/9.1_config_reference.md) | `part9_reference/9.1_config_reference.md` | Full env-var, config.json, state.json reference |
| [9.2 Error Code Registry](part9_reference/9.2_error_codes.md) | `part9_reference/9.2_error_codes.md` | All error messages and causes |
| [9.3 Glossary](part9_reference/9.3_glossary.md) | `part9_reference/9.3_glossary.md` | Complete terminology reference |
| [9.4 FAQ](part9_reference/9.4_faq.md) | `part9_reference/9.4_faq.md` | Frequently asked questions |
| [9.5 Key Contacts & Escalation](part9_reference/9.5_contacts.md) | `part9_reference/9.5_contacts.md` | Project contacts and escalation paths |

### Appendices

| Section | File | Description |
|---------|------|-------------|
| [A. Diagrams](appendices/A_diagrams.md) | `appendices/A_diagrams.md` | All architectural diagrams (Mermaid) |
| [B. Schema Specifications](appendices/B_schemas.md) | `appendices/B_schemas.md` | state.json, config.json, DTO & tool schemas |
| [C. Runbook Index](appendices/C_runbook_index.md) | `appendices/C_runbook_index.md` | Quick-reference runbook list |
| [D. Post-Mortem Archive](appendices/D_postmortems.md) | `appendices/D_postmortems.md` | Historical issue analysis |
| [E. Technical Debt Registry](appendices/E_tech_debt.md) | `appendices/E_tech_debt.md` | Known debt items and remediation plans |

### Slides

| Section | File | Description |
|---------|------|-------------|
| [Overview Deck](slides/agents_council_deck.md) | `slides/agents_council_deck.md` | Marp executive/architecture deck |

---

*Documentation generated 2026-05-22. Source: `agents-council` v0.4.0 (commit on `main`). Generated in the style of the `qa_system_v2bis` technical documentation suite.*

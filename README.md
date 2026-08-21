# AI Development & Operations Framework

> 中文版: [README.zh-CN.md](README.zh-CN.md)

## Overview

This reusable project-level skill establishes an auditable collaboration framework for AI-assisted development, diagnosis, and operations. Every project must complete the P0–P2 baseline, enforce first-time AI development onboarding, and document verified modules, data, and major execution paths in P1; P3 pilot work and P4 governance are optional.

## What It Solves

- Makes AI locate project knowledge, code facts, and ownership boundaries before acting instead of guessing from generic knowledge.
- Organizes the knowledge entry point, development conventions, and operations runbook as project assets usable by different AI tools.
- Keeps knowledge current with delivery work and separates verified facts, open questions, and unperformed validation.
- Removes later discovery gaps through a module inventory, key tables/fields, and traceable execution paths.

## Required Baseline

| Phase | Required outcome |
|---|---|
| P0 | Confirm scope, sources of truth, and ownership; add root `AGENTS.md` and the onboarding entry point. |
| P1 | Build architecture, terminology, domain logic, data dictionary, anti-patterns, known issues, and operations knowledge from target-project facts. |
| P2 | Create project knowledge, development-spec, and operations skills with cross-tool loading rules. |

P3 (a real-task pilot) and P4 (recurring governance and rollout) are optional and must not be presented as prerequisites for P0–P2 completion.

## Phase-Gated Construction

The first invocation starts at P0. After P0, the AI must wait for the developer to confirm P0 and onboarding before entering P1; after P1 delivers full fact documentation and coverage gaps, it waits again before entering P2. The AI must not bypass a pending gate in one turn. Passing P2 acceptance completes the required baseline.

See [Phase-gated construction](references/phase-gated-construction.md) for details.

## Detailed P1 Fact Documentation

P1 must document verified facts in `system/`: a complete module inventory, dependencies and entry points, major domain flows, involved Controllers/Listeners, Services, Mapper/XML, tables, messages and external calls, as well as key fields/enums/state machines, authorization, idempotency, asynchronous retry, and operational anchors. Anything not verified must be explicitly marked as open.

See [Detailed system documentation](references/detailed-system-documentation.md) for full templates and acceptance criteria.

## Knowledge Repository Layout

The `ai-knowledge/` root contains only the repository entry point, onboarding, and framework-governance documents. All facts describing how the current system works—including architecture, terminology, data dictionaries, domain logic, anti-patterns, and known issues—belong in `ai-knowledge/system/`; the architecture overview specifically belongs in `system/architecture.md`. Original requirements and external contracts belong in `PRD/`, development, research, and validation plans belong in `plan/`, while operational runbooks belong in `ops/`.

See [Knowledge repository layout](references/knowledge-directory-layout.md) for the full tree and ownership boundaries.

## First-Time AI Development Onboarding

Every project must enforce onboarding through both its root entry point and knowledge skill. At the start of each relevant task, the AI silently checks its local completion state. A matching record for the current local developer, AI tool, and project skips onboarding—even in a new conversation; only a missing record triggers the onboarding document and confirmation gate.

Completion state must exist only in local persistent memory scoped to the current local developer, AI tool, and project identity, and persist across later conversations. Prefer the Git remote URL as the project identity and use the absolute path only when no remote exists. Never store this state in the repository, Git configuration, databases, or any shared medium; the project P0–P2 plan is not an onboarding-completion marker.

## How to Use

1. Load `SKILL.md` and complete P0. During initial setup, create only the onboarding entry point and do not inspect target-project facts.
2. After the developer confirms onboarding, inventory and document verified target-project knowledge in P1.
3. Complete P2 by creating and connecting the three project skill types.
4. Opt into P3/P4 only when appropriate, and report phase evidence plus unperformed validation at handoff.

## Usage with AI Tools (Codex, Claude Code, and Others)

This skill follows the Agent Skills specification (`SKILL.md` + `references/`) and can be loaded by any tool that supports it or can read Markdown by directory:

| Tool | How to load |
|---|---|
| **pi** | `.agents/skills/` is pi's project-level skill directory, auto-discovered at startup. It loads automatically when the task matches the description, or manually via `/skill:ai-dev-ops-framework` |
| **Claude Code** | Supports the Agent Skills spec: sync/link this directory into Claude Code's skill path (e.g. `~/.claude/skills` or project `.claude/skills`), or direct it via the root `AGENTS.md`/`CLAUDE.md` |
| **Codex / OpenAI** | `agents/openai.yaml` provides the OpenAI tool-interface description; you may also reference `.agents/skills/` as a project rules directory or instruct the session to read `SKILL.md` |
| **Other tools** | Tools supporting the Agent Skills spec load this directory directly; tools without project-level skill sync fall back to reading the maintained source per the root `AGENTS.md` |

General principles:
- Keep the project-level skill source under version control; **never copy it to a user-global skill directory**.
- Start with the P0–P2 flow in `SKILL.md` and respect each phase's confirmation gate.
- The skill is a lightweight entry point and constraint; keep volatile project facts in the project knowledge base and read them on demand to avoid loading the whole project into context.

## Contents

- [Skill entry point and rules](SKILL.md)
- [P0–P2 implementation guide](references/p0-p2.md)
- [First-onboarding rules](references/first-onboarding.md)
- [Project templates](references/project-templates.md)
- [Knowledge repository layout](references/knowledge-directory-layout.md)
- [Phase-gated construction](references/phase-gated-construction.md)
- [Detailed system documentation](references/detailed-system-documentation.md)

## Boundaries

This skill provides a construction method and templates, not target-project facts. Do not copy business terminology, database semantics, technology rules, or production procedures from another project; rebuild them from the target project's actual code, documentation, configuration, schema, and developer confirmation.

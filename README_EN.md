# AI Development & Operations Framework

[![中文](https://img.shields.io/badge/语言-中文-brightgreen)](README.md) [![English](https://img.shields.io/badge/Language-English-blue)](README_EN.md)

## Overview

This reusable project-level skill establishes an auditable collaboration framework for AI-assisted development, diagnosis, and operations. Every project must complete the P0–P2 baseline and enforce a first-time AI development onboarding; P3 pilot work and P4 governance are optional.

## What It Solves

- Makes AI locate project knowledge, code facts, and ownership boundaries before acting instead of guessing from generic knowledge.
- Organizes the knowledge entry point, development conventions, and operations runbook as project assets usable by different AI tools.
- Keeps knowledge current with delivery work and separates verified facts, open questions, and unperformed validation.

## Required Baseline

| Phase | Required outcome |
|---|---|
| P0 | Confirm scope, sources of truth, and ownership; add root `AGENTS.md` and the onboarding entry point. |
| P1 | Build architecture, terminology, domain logic, data dictionary, anti-patterns, known issues, and operations knowledge from target-project facts. |
| P2 | Create project knowledge, development-spec, and operations skills with cross-tool loading rules. |

P3 (a real-task pilot) and P4 (recurring governance and rollout) are optional and must not be presented as prerequisites for P0–P2 completion.

## Knowledge Repository Layout

The `ai-knowledge/` root contains only the repository entry point, onboarding, and framework-governance documents. All facts describing how the current system works—including architecture, terminology, data dictionaries, domain logic, anti-patterns, and known issues—belong in `ai-knowledge/system/`; the architecture overview specifically belongs in `system/architecture.md`. Original requirements and external contracts belong in `PRD/`, development, research, and validation plans belong in `plan/`, while operational runbooks belong in `ops/`.

See the [knowledge repository layout](references/knowledge-directory-layout.md) for the complete directory tree and ownership boundaries.

## Using This Skill with AI Tools

Keep this repository's directory structure intact, especially `SKILL.md`, `references/`, and `agents/openai.yaml`. `SKILL.md` is the entry point, and its referenced files must remain available through their relative paths.

### Codex

1. Place this repository in a Codex-configured skills directory. A common Windows location is `C:\Users\<username>\.codex\skills\ai-dev-ops-framework`; confirm installation by checking that `ai-dev-ops-framework` appears in Codex's Skills list.
2. Open Codex in the target-project root and enter:

   ```text
   Use $ai-dev-ops-framework to establish the required P0-P2 AI development and operations framework for this project.
   ```

3. On first use, complete P0 and the first-time AI development onboarding. Only after the developer confirms the onboarding should the AI inventory project facts and continue with P1/P2.

### Claude Code

1. Copy or link the complete skill directory to `.agents/skills/ai-dev-ops-framework/` in the target project.
2. Create or update the target project's root `CLAUDE.md` to import the entry point:

   ```markdown
   @.agents/skills/ai-dev-ops-framework/SKILL.md
   ```

3. Start Claude Code from the project root and explicitly ask it to follow this skill for P0-P2. Until onboarding is confirmed, it must not analyze the actual task, inspect project facts, or modify the project.

### Other AI Tools

1. Treat this skill directory as the version-controlled distribution source; after project adoption, `.agents/skills/` is the source of truth for project-level skills.
2. If the tool supports project instructions or skill synchronization, sync or link `.agents/skills/` to its project-level skills location. Otherwise, require the tool to read the relevant `SKILL.md` directly and follow its linked references as needed.
3. Declare the skill source, task-based loading rules, and first-time onboarding restriction in the target project's root `AGENTS.md`. See the [project templates](references/project-templates.md) for a minimal template.

## First-Time AI Development Onboarding

Every project must enforce onboarding through both its root entry point and knowledge skill. When the current developer first uses the current AI tool for development, diagnosis, data repair, or operations, the AI may only check its own local completion state and read the onboarding document. It must not analyze the task, inspect project facts, or make changes until the developer confirms.

Completion state must exist only in local persistent memory scoped to the current developer, AI tool, and project identity. Prefer the Git remote URL as the project identity and use the absolute path only when no remote exists. Never store this state in the repository, Git configuration, databases, or any shared medium.

## How to Use

1. Load `SKILL.md` and complete P0. During initial setup, create only the onboarding entry point and do not inspect target-project facts.
2. After the developer confirms onboarding, inventory and document verified target-project knowledge in P1.
3. Complete P2 by creating and connecting the three project skill types.
4. Opt into P3/P4 only when appropriate, and report phase evidence plus unperformed validation at handoff.

## Contents

- [Skill entry point and rules](SKILL.md)
- [P0–P2 implementation guide](references/p0-p2.md)
- [First-onboarding rules](references/first-onboarding.md)
- [Project templates](references/project-templates.md)
- [Knowledge repository layout](references/knowledge-directory-layout.md)

## Boundaries

This skill provides a construction method and templates, not target-project facts. Do not copy business terminology, database semantics, technology rules, or production procedures from another project; rebuild them from the target project's actual code, documentation, configuration, schema, and developer confirmation.

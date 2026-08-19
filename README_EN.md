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

## Boundaries

This skill provides a construction method and templates, not target-project facts. Do not copy business terminology, database semantics, technology rules, or production procedures from another project; rebuild them from the target project's actual code, documentation, configuration, schema, and developer confirmation.

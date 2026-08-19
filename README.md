# AI 开发运维体系建设 / AI Development & Operations Framework

## 简介 / Overview

这是一个可复用的项目级 skill，用于在新项目或存量项目中建立可审计的 AI 开发、排查与运维协作体系。它要求每个项目完成 P0–P2 基线，并强制“首次 AI 开发导览”；P3 真实需求试点和 P4 治理推广按需执行。

This reusable project-level skill establishes an auditable collaboration framework for AI-assisted development, diagnosis, and operations. Every project must complete the P0–P2 baseline and enforce a first-time AI development onboarding; P3 pilot work and P4 governance are optional.

## 解决的问题 / What It Solves

- 让 AI 在开发前先定位项目知识、代码事实与责任边界，而非按通用经验猜测业务含义。
- 将知识入口、开发规范和运维 runbook 组织为可由不同 AI 工具加载的项目资产。
- 让知识随需求变更同步保鲜，并清晰区分已验证事实、待确认内容与未执行验证。

- Makes AI locate project knowledge, code facts, and ownership boundaries before acting instead of guessing from generic knowledge.
- Organizes the knowledge entry point, development conventions, and operations runbook as project assets usable by different AI tools.
- Keeps knowledge current with delivery work and separates verified facts, open questions, and unperformed validation.

## 必须交付 / Required Baseline

| 阶段 / Phase | 必须内容 / Required outcome |
|---|---|
| P0 | 确认体系范围、权威来源、维护责任；建立根 `AGENTS.md` 与首次导览入口。 / Confirm scope, sources of truth, and ownership; add root `AGENTS.md` and the onboarding entry point. |
| P1 | 根据目标项目真实资料建立架构总览、术语、领域逻辑、数据字典、反模式、已知问题及运维知识。 / Build architecture, terminology, domain logic, data dictionary, anti-patterns, known issues, and operations knowledge from target-project facts. |
| P2 | 落地 knowledge、dev-spec、ops 三类项目 skill，并接入跨工具加载规则。 / Create project knowledge, development-spec, and operations skills with cross-tool loading rules. |

P3（真实需求试点）和 P4（定期治理与推广）可选，不应被标记为 P0–P2 完成的前置条件。

P3 (a real-task pilot) and P4 (recurring governance and rollout) are optional and must not be presented as prerequisites for P0–P2 completion.

## 首次 AI 开发导览 / First-Time AI Development Onboarding

每个项目必须在根入口和 knowledge skill 中共同实施首次导览。当前开发者首次使用当前 AI 工具处理开发、排查、数据修复或运维任务时，AI 只能检查自己的本地完成状态并阅读导览文档；开发者确认前，不得分析需求、检索项目事实或修改任何内容。

Every project must enforce onboarding through both its root entry point and knowledge skill. When the current developer first uses the current AI tool for development, diagnosis, data repair, or operations, the AI may only check its own local completion state and read the onboarding document. It must not analyze the task, inspect project facts, or make changes until the developer confirms.

完成状态必须仅保存在“当前开发者 + 当前 AI 工具 + 当前项目标识”的本地持久记忆中。项目标识优先使用 Git 远程地址，无远程地址时才使用绝对路径；不得写入仓库、Git 配置、数据库或其他共享介质。

Completion state must exist only in local persistent memory scoped to the current developer, AI tool, and project identity. Prefer the Git remote URL as the project identity and use the absolute path only when no remote exists. Never store this state in the repository, Git configuration, databases, or any shared medium.

## 使用方式 / How to Use

1. 加载 `SKILL.md`，先完成 P0；首次搭建时仅创建导览入口，不检索目标项目事实。
2. 开发者确认导览后，根据 P1 盘点并沉淀目标项目真实知识。
3. 完成 P2，创建并接入三类项目 skill。
4. 按需选择 P3/P4，并在交付中报告阶段验收证据与未执行验证。

1. Load `SKILL.md` and complete P0. During initial setup, create only the onboarding entry point and do not inspect target-project facts.
2. After the developer confirms onboarding, inventory and document verified target-project knowledge in P1.
3. Complete P2 by creating and connecting the three project skill types.
4. Opt into P3/P4 only when appropriate, and report phase evidence plus unperformed validation at handoff.

## 内容导航 / Contents

- [Skill 入口与规则 / Skill entry point and rules](SKILL.md)
- [P0–P2 落地指南 / P0–P2 implementation guide](references/p0-p2.md)
- [首次导览规则 / First-onboarding rules](references/first-onboarding.md)
- [项目模板 / Project templates](references/project-templates.md)

## 使用边界 / Boundaries

本 skill 提供的是建设方法和模板，而不是目标项目的事实来源。不得复制其他项目的业务术语、数据库语义、技术栈规则或生产操作步骤；这些内容必须由目标项目的实际代码、文档、配置、表结构和开发者确认重新建立。

This skill provides a construction method and templates, not target-project facts. Do not copy business terminology, database semantics, technology rules, or production procedures from another project; rebuild them from the target project's actual code, documentation, configuration, schema, and developer confirmation.

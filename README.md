# AI 开发运维体系建设

[![中文](https://img.shields.io/badge/语言-中文-brightgreen)](README.md) [![English](https://img.shields.io/badge/Language-English-blue)](README_EN.md)

## 简介

这是一个可复用的项目级 skill，用于在新项目或存量项目中建立可审计的 AI 开发、排查与运维协作体系。它要求每个项目完成 P0–P2 基线，并强制“首次 AI 开发导览”；P3 真实需求试点和 P4 治理推广按需执行。

## 解决的问题

- 让 AI 在开发前先定位项目知识、代码事实与责任边界，而非按通用经验猜测业务含义。
- 将知识入口、开发规范和运维 runbook 组织为可由不同 AI 工具加载的项目资产。
- 让知识随需求变更同步保鲜，并清晰区分已验证事实、待确认内容与未执行验证。

## 必须交付

| 阶段 | 必须内容 |
|---|---|
| P0 | 确认体系范围、权威来源、维护责任；建立根 `AGENTS.md` 与首次导览入口。 |
| P1 | 根据目标项目真实资料建立架构总览、术语、领域逻辑、数据字典、反模式、已知问题及运维知识。 |
| P2 | 落地 knowledge、dev-spec、ops 三类项目 skill，并接入跨工具加载规则。 |

P3（真实需求试点）和 P4（定期治理与推广）可选，不应被标记为 P0–P2 完成的前置条件。

## 知识库目录

`ai-knowledge/` 根目录只保存知识库入口、首次导览和体系治理文档。所有“当前系统如何运行”的事实，包括系统架构、术语、数据字典、领域逻辑、反模式和已知问题，必须位于 `ai-knowledge/system/`；特别是架构总览固定为 `system/architecture.md`。原始需求与外部契约位于 `PRD/`，开发过程产生的实施、调研与验证计划位于 `plan/`，运维操作手册位于 `ops/`。

完整树形结构与职责边界见 [知识库目录规划](references/knowledge-directory-layout.md)。

## 首次 AI 开发导览

每个项目必须在根入口和 knowledge skill 中共同实施首次导览。当前开发者首次使用当前 AI 工具处理开发、排查、数据修复或运维任务时，AI 只能检查自己的本地完成状态并阅读导览文档；开发者确认前，不得分析需求、检索项目事实或修改任何内容。

完成状态必须仅保存在“当前开发者 + 当前 AI 工具 + 当前项目标识”的本地持久记忆中。项目标识优先使用 Git 远程地址，无远程地址时才使用绝对路径；不得写入仓库、Git 配置、数据库或其他共享介质。

## 在 AI 工具中使用本 Skill

使用前请保留本仓库的完整目录结构，尤其是 `SKILL.md`、`references/` 和 `agents/openai.yaml`。`SKILL.md` 是入口，引用的资料必须保持相对路径可访问。

### Codex

1. 将本仓库放入 Codex 已配置的 skill 目录；本机常见位置为 `C:\Users\<用户名>\.codex\skills\ai-dev-ops-framework`。以 Codex 的 Skills 列表中出现 `ai-dev-ops-framework` 为安装完成依据。
2. 在目标项目根目录打开 Codex，并输入：

   ```text
   使用 $ai-dev-ops-framework 为当前项目建立必需的 P0-P2 AI 开发运维体系。
   ```

3. 首次使用时，先完成 P0 和首次 AI 开发导览；开发者确认导览后，再盘点项目事实并继续 P1/P2。

### Claude Code

1. 将本 skill 完整目录复制或链接到目标项目的 `.agents/skills/ai-dev-ops-framework/`。
2. 在目标项目根目录创建或补充 `CLAUDE.md`，导入该入口：

   ```markdown
   @.agents/skills/ai-dev-ops-framework/SKILL.md
   ```

3. 在项目根目录启动 Claude Code 后，明确要求它按该 skill 执行 P0-P2。首次导览未确认前，不得开始分析实际需求、检索项目事实或修改项目。

### 其他 AI 工具

1. 将本 skill 目录作为可版本管理的分发源；项目落地后的项目级 skill 维护源固定为 `.agents/skills/`。
2. 工具支持项目说明或 skill 同步时，将 `.agents/skills/` 同步或链接到该工具的项目级 skill 路径；不支持时，要求工具直接读取对应的 `SKILL.md`，并沿其链接按需读取参考资料。
3. 在目标项目根 `AGENTS.md` 中声明 skill 维护源、按任务加载规则和首次导览限制。最小模板见[项目模板](references/project-templates.md)。

## 使用方式

1. 加载 `SKILL.md`，先完成 P0；首次搭建时仅创建导览入口，不检索目标项目事实。
2. 开发者确认导览后，根据 P1 盘点并沉淀目标项目真实知识。
3. 完成 P2，创建并接入三类项目 skill。
4. 按需选择 P3/P4，并在交付中报告阶段验收证据与未执行验证。

## 内容导航

- [Skill 入口与规则](SKILL.md)
- [P0–P2 落地指南](references/p0-p2.md)
- [首次导览规则](references/first-onboarding.md)
- [项目模板](references/project-templates.md)
- [知识库目录规划](references/knowledge-directory-layout.md)

## 使用边界

本 skill 提供的是建设方法和模板，而不是目标项目的事实来源。不得复制其他项目的业务术语、数据库语义、技术栈规则或生产操作步骤；这些内容必须由目标项目的实际代码、文档、配置、表结构和开发者确认重新建立。

# AI 开发运维体系建设

[![中文](https://img.shields.io/badge/语言-中文-brightgreen)](README.md) [![English](https://img.shields.io/badge/Language-English-blue)](README_EN.md)

## 简介

这是一个可复用的项目级 skill，用于在新项目或存量项目中建立可审计的 AI 开发、排查与运维协作体系。它要求每个项目完成 P0–P2 基线，并强制"首次 AI 开发导览"；P1 必须沉淀模块、数据表和主要链路的事实文档；P3 真实需求试点和 P4 治理推广按需执行。

## 解决的问题

- 让 AI 在开发前先定位项目知识、代码事实与责任边界，而非按通用经验猜测业务含义。
- 将知识入口、开发规范和运维 runbook 组织为可由不同 AI 工具加载的项目资产。
- 让知识随需求变更同步保鲜，并清晰区分已验证事实、待确认内容与未执行验证。
- 用模块清单、关键表/字段和可追溯主链路消除后续开发中的定位盲区。

## 必须交付

| 阶段 | 必须内容 |
|---|---|
| P0 | 确认体系范围、权威来源、维护责任；建立根 `AGENTS.md` 与首次导览入口。 |
| P1 | 根据目标项目真实资料建立架构总览、术语、领域逻辑、数据字典、反模式、已知问题及运维知识。 |
| P2 | 落地 knowledge、dev-spec、ops 三类项目 skill，并接入跨工具加载规则。 |

P3（真实需求试点）和 P4（定期治理与推广）可选，不应被标记为 P0–P2 完成的前置条件。

## 分阶段建设

首次调用从 P0 开始，P0 完成后必须等待开发者确认且已阅读导览，才可进入 P1；P1 交付完整事实文档和覆盖缺口后再次等待确认，才可进入 P2。AI 不得在同一轮绕过待确认阶段。P2 验收通过即完成必需体系基线。

详细规则见 [分阶段建设流程](references/phase-gated-construction.md)。

## P1 详细事实文档

P1 必须将已核对事实写入 `system/`：全量模块清单、模块依赖与入口，关键业务域的主链路，涉及的 Controller/Listener、Service、Mapper/XML、表、消息、外部调用，关键字段/枚举/状态机、权限、幂等、异步重试及运维锚点。不能确认的内容必须显式记录为待确认。

完整模板与验收项见 [详细系统文档规范](references/detailed-system-documentation.md)。

## 知识库目录

`ai-knowledge/` 根目录只保存知识库入口、首次导览和体系治理文档。所有"当前系统如何运行"的事实，包括系统架构、术语、数据字典、领域逻辑、反模式和已知问题，必须位于 `ai-knowledge/system/`；特别是架构总览固定为 `system/architecture.md`。原始需求与外部契约位于 `PRD/`，开发过程产生的实施、调研与验证计划位于 `plan/`，运维操作手册位于 `ops/`。

完整树形结构与职责边界见 [知识库目录规划](references/knowledge-directory-layout.md)。

## 首次 AI 开发导览

每个开发者使用每个 AI 工具时，分别完成一次项目导览。同人同工具的新会话必须查询固定状态，命中后静默跳过人工确认，仍按任务重新加载项目规则。换人或首次换工具独立导览；查询错误不能当作首次使用。

框架提供 [状态脚本](scripts/onboarding_state.mjs)，依赖 Node.js 18+ 和 Git，不安装第三方依赖。状态固定存于操作系统账号资料目录的 `.ai-dev-ops/onboarding/`，按开发者、工具和项目隔离，不使用沙箱可改写的 `HOME`、`LOCALAPPDATA`。脚本拒绝任何 Git 仓库内的状态路径，不写数据库或 Git 配置；规则和脚本可提交，个人状态不可提交。多人共用系统账号时必须使用各自稳定的 `--developer` 或本地 `AI_DEV_OPS_DEVELOPER_ID`。

```powershell
# 从框架源码目录检查目标项目；工具标识必须与当前工具一致。
node scripts/onboarding_state.mjs check --tool codex --repo <目标项目目录>

# 仅在开发者明确确认导览，或已核实本身份旧确认事实后登记，再回查。
node scripts/onboarding_state.mjs complete --tool codex --repo <目标项目目录> --confirmed
node scripts/onboarding_state.mjs check --tool codex --repo <目标项目目录>
```

返回 `COMPLETED` 时直接进入任务；`MISSING` 仅核实本身份旧本地确认记录，无依据才首次导览；`REQUIRED` 按开发者要求重做；`ERROR` 报告查询问题，不重复导览掩盖错误。项目 P0–P2 进度不代替个人确认。完整命令、退出码、迁移和重置见[本地状态协议](references/first-onboarding.md)。

接入目标项目时，将完整框架目录放到 `.agents/skills/ai-dev-ops-framework/`，同步根入口、导览正文与 knowledge skill 模板，保留 `scripts/` 和 `references/`；不能只复制说明文字。未原生加载根入口的工具，在其项目入口引用 `AGENTS.md`，例如 `CLAUDE.md` 使用 `@AGENTS.md`。是否安装启动 hook 由目标环境决定，未实测时不宣称自动生效。

## 框架开发与验证

维护本仓库遵守 [AGENTS.md](AGENTS.md)，目标项目接入仍按 P0–P2 分阶段进行。修改协议时同步 `SKILL.md`、相关引用、项目模板和中英文 README；不修改用户全局 skill 副本，不将任何目标项目的私有事实或个人状态带入发布源。

```powershell
node scripts/validate_framework.mjs
node --test scripts/onboarding_state.test.mjs scripts/validate_framework.test.mjs
```

静态验证检查文档引用、Markdown 代码块及 skill 入口结构；行为测试只使用仓库外临时目录，覆盖跨进程复用、人员/工具隔离、worktree、错误分流和重置。[持续验证](.github/workflows/validate.yml)在 Windows、Ubuntu 和 Node.js 18、22 上执行相同命令；CI 与真实 AI 客户端的新会话验证分别报告。回滚框架代码不会删除或共享个人本地状态。

## 使用方式

1. 加载 `SKILL.md`，先完成 P0；首次搭建时仅创建导览入口，不检索目标项目事实。
2. 开发者确认导览后，根据 P1 盘点并沉淀目标项目真实知识。
3. 完成 P2，创建并接入三类项目 skill。
4. 按需选择 P3/P4，并在交付中报告阶段验收证据与未执行验证。

## AI 工具使用说明（Codex、Claude Code 与其他 AI 工具）

本 skill 遵循 Agent Skills 规范（`SKILL.md` + `references/`），支持该规范或可按目录读取 Markdown 的 AI 工具均可加载：

| 工具 | 加载方式 |
|---|---|
| **pi** | `.agents/skills/` 是 pi 的项目级 skill 目录，启动时自动发现；任务匹配 description 自动加载，也可用 `/skill:ai-dev-ops-framework` 手动加载 |
| **Claude Code** | 支持 Agent Skills 规范：将本目录同步/链接到 Claude Code 的 skill 路径（如 `~/.claude/skills` 或项目 `.claude/skills`），或通过根 `AGENTS.md`/`CLAUDE.md` 指引按任务加载 |
| **Codex / OpenAI** | `agents/openai.yaml` 提供 OpenAI 工具接口描述；也可将 `.agents/skills/` 作为项目规则目录引用，或在会话中直接要求读取 `SKILL.md` |
| **其他工具** | 支持 Agent Skills 规范的工具直接加载本目录；不支持项目级 skill 同步的工具，按根 `AGENTS.md` 的回退方式直接读取维护源 |

通用原则：
- 项目级 skill 源随项目版本管理；**不得复制到用户全局 skill 目录**。
- 任务开始时按 `SKILL.md` 的 P0–P2 流程执行，遵守每阶段确认停点。
- skill 是轻量入口与约束，易变的项目事实放在项目知识库按需读取，避免把整个项目塞进上下文。

## 内容导航

- [Skill 入口与规则](SKILL.md)
- [P0–P2 落地指南](references/p0-p2.md)
- [首次导览规则](references/first-onboarding.md)
- [项目模板](references/project-templates.md)
- [知识库目录规划](references/knowledge-directory-layout.md)
- [分阶段建设流程](references/phase-gated-construction.md)
- [详细系统文档规范](references/detailed-system-documentation.md)

## 使用边界

本 skill 提供的是建设方法和模板，而不是目标项目的事实来源。不得复制其他项目的业务术语、数据库语义、技术栈规则或生产操作步骤；这些内容必须由目标项目的实际代码、文档、配置、表结构和开发者确认重新建立。

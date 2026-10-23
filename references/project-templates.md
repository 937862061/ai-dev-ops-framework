# 项目模板

以下模板用于建立最小骨架。复制到目标项目后，必须替换尖括号内容并按项目事实裁剪；不要把未核实的示例文本当作项目规则。

## `ai-knowledge/` 目录模板

```text
ai-knowledge/
├── readme.md                         # 知识库地图、加载策略和维护说明
├── ai-development-onboarding.md      # 首次 AI 开发导览
├── ai-dev-ops-design.md              # 本项目体系设计与职责约定
├── PRD/                              # 原始需求、签署约定、外部契约
├── plan/                             # 开发过程产生的实施、调研与验证计划
│   └── ai-dev-ops-plan.md            # 本项目 P0-P4 实施计划与状态
├── system/                           # 当前系统事实与领域知识
│   ├── architecture.md               # 技术栈、模块依赖、代码入口与集成边界
│   ├── glossary.md                   # L1：术语与易混淆点
│   ├── data-dictionary.md            # L3：表字段、枚举与状态流转
│   ├── anti-patterns.md              # 已证实的 AI/协作错误与预防措施
│   ├── known-issues.md               # 未解决业务/数据问题
│   └── <domain-or-module>.md         # L2：领域或模块流程
└── ops/                              # 巡检、日志、数据修复、发布与回滚 runbook
```

系统架构及所有描述“当前系统如何运行”的资料必须放在 `system/`，尤其是 `system/architecture.md`；不得在 `ai-knowledge/` 根目录另建重复的架构事实。开发过程产生的实施、调研和验证计划必须放在 `plan/`；计划完成后，已证实的系统事实要回填 `system/` 或 `ops/`，不能只留在计划文档中。`PRD/` 保留需求原文和外部契约，不作为当前实现行为的唯一依据；`ops/` 只存操作与排障流程。目录名称可以按项目语言调整，但职责边界、引用路径和唯一事实来源必须同步更新。

## 根 `AGENTS.md` 最小模板

```markdown
# <项目名> AI 协作入口

项目级 skill 的维护源为 `.agents/skills/`，随项目版本管理。开始开发、排查、数据修复或运维任务前：

1. 识别当前 AI 工具的项目级 skill 路径；将本仓库 `.agents/skills/` 同步或链接到该路径。
2. 工具不支持同步时，直接读取 `.agents/skills/` 中对应的 `SKILL.md`，并在交付中说明此回退方式。
3. 先加载 `<project>-knowledge`；代码改动再加载 `<project>-dev-spec`；线上排查、数据修复、巡检、发布再加载 `<project>-ops`。

每个新会话先运行固定查询（Node.js 18+）：`node .agents/skills/ai-dev-ops-framework/scripts/onboarding_state.mjs check --tool <当前工具稳定标识> --repo .`。工具标识如 codex、claude-code、cursor，不随会话或模型变化，不借用其他工具身份。每个开发者、每个工具分别完成一次导览；共用系统账号时，用 --developer 或本地 AI_DEV_OPS_DEVELOPER_ID 指定独立稳定的个人标识。

COMPLETED（退出码 0）直接进入任务，不重复展示导览，仍加载项目规范；MISSING（10）仅核实本开发者、本工具、本项目旧本地确认记录，有依据才迁移，无依据才只读 ai-knowledge/ai-development-onboarding.md 并等待确认；REQUIRED（10）重新导览，禁止迁回旧记录；ERROR（20）报告查询问题，不能当作首次使用或已完成。

明确确认或核实旧确认事实后才执行同身份的 complete --confirmed，再次 check 成功后进入需求分析。仅开发者要求重做时执行 reset，新会话不得清除旧记录。确认前只允许状态检查、读取状态协议和导览正文，不检索当前需求事实或执行变更。

状态固定在操作系统账号资料目录下的 .ai-dev-ops/onboarding/，不使用沙箱可能改写的 HOME、LOCALAPPDATA，按开发者、工具和规范化 Git 远程地址（无远程才用绝对路径）隔离。脚本拒绝仓库内状态，不写工作区、Git 配置、数据库或共享介质；plan/ 进度不代替个人确认。完整协议见 .agents/skills/ai-dev-ops-framework/references/first-onboarding.md；规则与脚本可提交，个人状态不可提交。

完成改动后，检查受影响知识资产是否需要同步；交付中区分已完成静态核对和未执行的运行、接口、数据库或第三方验证。
```

## `ai-knowledge/ai-development-onboarding.md` 最小模板

```markdown
# <项目名> AI 开发首次导览

本项目采用“根 AGENTS.md → 项目级 skill → ai-knowledge → 代码/数据库/外部契约”的协作结构。

- `<project>-knowledge`：术语、领域流程、字段、状态与已知反模式的入口；业务概念不明确时必须提问。
- `<project>-dev-spec`：按现有工程提炼的编码、事务、异常、数据库与验证规范。
- `<project>-ops`：线上排查、数据修复、巡检、发布与回滚入口。

AI 会按需阅读知识，不会把所有文档加载进上下文；会定位真实入口、服务、数据访问与表字段。概念有歧义时会停止猜测，跨模块/状态流转/范围不清时会先给出概念理解确认清单。开发者确认业务语义、范围及高风险动作；AI 说明事实来源、验证结果与未验证项，并在必要时更新知识库。

每个新会话按根 AGENTS.md 执行 onboarding_state.mjs check：COMPLETED 跳过本导览；MISSING 只核实本身份旧本地确认记录，有依据才迁移，无依据才首次导览；REQUIRED 重新导览，不恢复旧状态；ERROR 报告失败，不能当作首次使用。

确认前仅允许状态检查、读取本文件和状态协议。明确确认“已阅读导览，可以开始”后，执行同身份的 complete --confirmed 并回查成功，再分析需求。状态按开发者、AI 工具和项目分别存于仓库外固定个人目录，不进 Git、数据库或共享介质；共用系统账号时使用独立个人标识。
```

## knowledge skill 最小模板

```markdown
---
name: <project>-knowledge
description: <项目名> 的开发、排查、接口和数据任务的知识入口。用于首次导览、术语确认、真实执行路径与字段定位；不用于脱离项目事实的通用解释。
---

# <项目名> 知识入口

每个新会话先执行根 AGENTS.md 的固定查询：`node .agents/skills/ai-dev-ops-framework/scripts/onboarding_state.mjs check --tool <本工具稳定标识> --repo .`。COMPLETED 跳过导览但仍加载规范；MISSING 只核实本身份旧本地确认记录，有依据才迁移，无依据才首次导览；REQUIRED 重新导览，禁止迁回旧状态；ERROR 报告原因，不重复导览掩盖查询错误。

明确确认或核实旧确认事实后才执行同身份的 complete --confirmed 并回查；未确认不登记，仅开发者要求重做时 reset。状态按开发者、工具和项目存于仓库外固定个人目录，不进 Git 或数据库，不跨人跨工具复用；共用账号用独立稳定开发者标识。完整协议见 `.agents/skills/ai-dev-ops-framework/references/first-onboarding.md`。

确认后按需加载：`ai-knowledge/system/architecture.md` 用于定位；`system/` 下的术语词典、数据字典、反模式记录按关键词检索；仅读取 `system/` 下相关域的逻辑文档；`PRD/` 仅在需求溯源或外部对接时读取；`ops/` 仅在运维任务时读取；已知问题仅在开发者要求分析时读取。

不得以一段概览替代实际定位：领域文档必须保留入口、服务、数据访问、主表/字段、消息或外部调用的事实锚点；数据字典必须覆盖该领域主链路触达的关键表、状态字段和枚举。

业务概念、字段、枚举或状态不清，或文档与代码冲突时，停止猜测并向开发者提问。跨模块、状态流转或需求含糊时，先输出“需求、概念→系统语义→代码实体、涉及模块/接口/字段、待确认点”的概念理解确认清单。

完成需求后，检查术语、领域逻辑、数据字典或反模式记录是否应同步更新。
```

## dev-spec 与 ops skill 的编写原则

- dev-spec 只写目标项目已证实的代码组织、鉴权、错误提示、事务、异步、数据库、测试与交付规范；框架通用知识不重复，无法确认的规则标为待确认。
- ops skill 只写经授权的环境、日志、巡检、SQL 数据修复前置检查、发布回滚与停止条件；生产操作必须要求明确授权及可回退方案。
- 两者都应链接目标项目知识库的实际路径，避免把详细规则复制到多个 skill 中。

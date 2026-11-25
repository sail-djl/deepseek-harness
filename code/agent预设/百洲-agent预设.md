# Agent 预设（code模式）

> code 分支专属 Agent 预设。登记处：`.guide_code/agent预设/`。
> 实际配置文件在 `packages/bundle/web-app/presets/`，本文只登记结构，不复制明文账密。

## 位置与文件

目录：`packages/bundle/web-app/presets/`

| 文件 | 预设 id / 名称 | order | 说明 |
| :-- | :-- | :-: | :-- |
| `code.patch.yml` | `code` / code模式 | 0 | 基于 standard 全量复制 + `tool-presentation`（`mode: ptc`，即 Code Mode） |

内置其余预设（非定制）：`standard`(1) / `ptc`(2) / `minimal`(3) / `cordis`(4)。

`code.patch.yml` 是 `@deepseek-ai/dsh-agent-preset` 插件的 `insert` 行内 patch（0.2.x 格式）。

## code 模式的百洲差异（相对 standard 预设）

- 唯一 delta：追加 `tool-presentation`（`@deepseek-ai/dsh-agent-tool-presentation`），`mode: ptc`——即 Code Mode，模型生成一个 TypeScript 程序组合多步工具调用，经 `run_code` 一次执行
- ⚠️ 模式值只有 `native` / `ptc` 两种（见 `packages/core/agent-tool-presentation/src/index.ts`）；`.guide/subfiles/.agent-presets/架构/code.md` 中的 `mode: code` 是历史术语，等价于 `ptc`
- 其余插件、参数与 `standard.patch.yml` 完全一致（含 `tool-web fetch: true`、workflow 启用）
- 排序：`order: 0`，位于 standard（1）之前

## 注册方式（web-app/package.json）

- `files` 数组包含 `presets/code.patch.yml`（与 standard/ptc/minimal/cordis 并列，共 5 个）
- `dsh.bundle.patch` 的 preset 列表包含对应路径

## 移除记录：bzcode 三件套（2026-10-18）

按用户指令，code 版本重新打包前移除以下三个预设（`package.json` 注销 + 文件删除），新 code 预设内置（随提交 `055b5ee376` 于 2026-10-20 落库）：

| 已移除文件 | 原预设 id / 名称 | 原 order |
| :-- | :-- | :-: |
| `bzcode.patch.yml` | `bzcode` / 百洲 开发者模式 | -3 |
| `bzcode-haiyu.patch.yml` | `bzcode-haiyu` / 百洲 海渔开发者 | -2 |
| `bzcode-shuili.patch.yml` | `bzcode-shuili` / 百洲 水利开发者 | -1 |

- 三件套原基于上游 `ptc.patch.yml` 叠加百洲差异；haiyu/shuili 另含业务 MCP Server 行（清单存档见 [`../mcp/`](../mcp/)）
- 影响面核查：仓库代码/测试中无其他 `bzcode` 引用，仅 `package.json` 注册（已同步移除）

## ⚠️ 安全提示（历史）

已删除的 `bzcode-haiyu.patch.yml` / `bzcode-shuili.patch.yml` 的 MCP Server 行含**明文数据库/SSH 账密**（如 `SSH_MCP_PASSWORD`）：

- **git 历史中仍保留这些明文账密**（删除只移除当前树）；对外分发仓库前需评估改写历史或轮换凭据
- **不要**把明文账密复制进任何共享文档（`.guide/`、guide 仓库、README 等）

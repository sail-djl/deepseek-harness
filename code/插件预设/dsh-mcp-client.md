# 插件预设（@deepseek-ai/dsh-mcp-client workspace 接入）

> code 分支专属插件接入。登记处：`.guide_code/插件预设/`。
> MCP 驱动插件：让模型像用原生工具一样调用外部 MCP Server（工具名如 `mcp__github__create_issue`；每台 Server 一条配置记录；默认不启用任何 Server）。
> **包体是上游 workspace 包**（`packages/mcp/mcp-client`，`.master` 已有同目录）；**code 自预设的是 web-app 依赖接入**——本条登记的对象。

## 改动点

| 文件 | 改动 |
| :-- | :-- |
| `packages/bundle/web-app/package.json` | 新增依赖 `@deepseek-ai/dsh-mcp-client: workspace:*`（第 144 行）——`.master` 的 web-app 没有这条依赖 |

**无挂载行**：`cordis.patch.yml` 与 `presets/*.patch.yml` 都不含 `dsh-mcp-client` 行——它是「供层挂载的依赖」：preset / profile 层写 `name: '@deepseek-ai/dsh-mcp-client'` 行时经 web-app 的 node_modules 解析（同 CLI 的随附策略：随附依赖、默认不启用任何 Server，因为每条服务器命令都是 agent 沙箱外的受信任可执行代码）。

**无 pnpm 补丁** → `patches/`、`pnpm-workspace.yaml`、`runtime-patch-policy.ts` 均无条目（预期状态，不是漏登）。

## 沿革与现状

- 2026-10-17 随 dsh-better-sidebar 变更一并接入（同期登记：`.version.yaml` 与 `dsh-better-sidebar.md` 的改动点行），目的是支撑当时内嵌在业务预设里的 MCP Server（bzcode-haiyu / bzcode-shuili，见 [`../mcp/业务-mcp清单.md`](../mcp/业务-mcp清单.md)）。
- 2026-10-18 三件套（内嵌 MCP Server 行、含明文账密的 preset）移除后，**依赖保留**：profile / preset 仍可自行挂 MCP Server（本机 profile 的 MCP 清单另按 `ai-mcp-sec` skill 维护，不在本仓）。
- 当前 code 快照**无任何挂载行**——依赖处于「随包可挂」状态，正是它容易被清单漏掉的原因。
- 配置字段真源：`packages/mcp/mcp-client/README.zh.md` 与上游配置目录 `docs/config-catalog.zh.md#deepseek-aidsh-mcp-client`。

## git 状态

随 code 快照初始提交 `53181aa024b`（2026-10-22 恢复快照）入库；原 master_code 历史随 `.git` 重建丢失，**原始接入提交号不可考**。2026-10-24 复核快照工作区干净。本条为 2026-10-24 补录。

## 升级注意

workspace 依赖没有独立版本号，上游改 `packages/mcp/mcp-client` 时随整体升级滚动。上游仓库私有（raw 直取 404）无法直查 rc.x 的 web-app 是否也加了同名依赖——fork 对齐巡检（`win-dsh-package-sec`）时若发现上游已带，删掉重复行、保留一行即可。

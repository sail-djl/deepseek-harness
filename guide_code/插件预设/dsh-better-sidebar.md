# 插件预设（dsh-better-sidebar 0.26.0）

> code 分支专属插件替换。登记处：`.guide_code/插件预设/`。
> 用外部插件 `dsh-better-sidebar` 工作台替换上游内置的 `ui-sidebar-files` 右侧栏文件树。

## 改动点

| 文件 | 改动 |
| :-- | :-- |
| `packages/bundle/web-app/package.json` | 新增依赖 `dsh-better-sidebar: 0.26.0`；移除依赖 `@deepseek-ai/dsh-client-ui-sidebar-files`；新增依赖 `@deepseek-ai/dsh-mcp-client`（支撑 agent 预设里的 MCP） |
| `packages/bundle/web-app/cordis.patch.yml` | 把 `- id: ui-sidebar-files / name: '@deepseek-ai/dsh-client-ui-sidebar-files'` 一行替换为 `- id: better-sidebar-bundled / name: 'dsh-better-sidebar'`（第 301–302 行） |
| `patches/dsh-better-sidebar@0.26.0.patch` | pnpm 补丁（约 7.7 KB），把插件的服务注入 `webRuntime` → `webStartup`（适配新版 DSH 的 trustedHosts API 迁移） |

## 挂载语义

`cordis.patch.yml` 注释说明：`dsh-better-sidebar` 自带的 bundle 补丁在 `better-sidebar-bundled` 行已挂载该包时会**回退**，因此「profile 同时把 `dsh-better-sidebar` 装成 bundle」的场景下也只会挂载一次。

## pnpm 补丁

`patches/dsh-better-sidebar@0.26.0.patch` 是 pnpm patch（`pnpm patch` 生成、`pnpm patch-commit` 应用），修改 `lib/index.js` 与 `lib/types/context-types.d.ts`：`inject` 数组及 `apply()` 内的 trustedHosts 读取从 `ctx.webRuntime` 改为 `ctx.webStartup`。这是为了兼容当前 `code` 分支的 DSH 服务拓扑（`webRuntime` 已被 `webStartup` 取代）。

## git 状态

依赖 + 配置 + pnpm 补丁均为未跟踪（`??`）/ 未暂存（` M`）。

## 升级注意

升级 `dsh-better-sidebar` 版本时：重新生成 pnpm 补丁（`pnpm patch dsh-better-sidebar@<new>` → 手工迁移 `webRuntime→webStartup` 改动 → `pnpm patch-commit`），并更新 `package.json` 版本号与 `patches/` 下补丁文件名。

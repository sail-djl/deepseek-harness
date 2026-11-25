# 插件预设（dsh-better-sidebar 0.26.0）

> code 分支专属插件替换。登记处：`.guide_code/插件预设/`。
> 用外部插件 `dsh-better-sidebar` 工作台替换上游内置的 `ui-sidebar-files` 右侧栏文件树。

## 改动点

| 文件 | 改动 |
| :-- | :-- |
| `packages/bundle/web-app/package.json` | 新增依赖 `dsh-better-sidebar: 0.26.0`；移除依赖 `@deepseek-ai/dsh-client-ui-sidebar-files`；新增依赖 `@deepseek-ai/dsh-mcp-client`（支撑 agent 预设里的 MCP；该接入已拆出独立文档 [`dsh-mcp-client.md`](dsh-mcp-client.md)） |
| `packages/bundle/web-app/cordis.patch.yml` | 把 `- id: ui-sidebar-files / name: '@deepseek-ai/dsh-client-ui-sidebar-files'` 一行替换为 `- id: better-sidebar-bundled / name: 'dsh-better-sidebar'`（第 306–307 行） |
| `patches/dsh-better-sidebar@0.26.0.patch` | pnpm 补丁（约 7.7 KB），把插件的服务注入 `webRuntime` → `webStartup`（适配新版 DSH 的 trustedHosts API 迁移） |
| `pnpm-workspace.yaml` | `patchedDependencies` 注册 `dsh-better-sidebar@0.26.0: patches/dsh-better-sidebar@0.26.0.patch`；`minimumReleaseAgeExclude` 放行 `dsh-better-sidebar@0.26.0` |
| `apps/desktop/scripts/runtime-patch-policy.ts` | 白名单登记 `dsh-better-sidebar@0.26.0`，`scope: shared`（插件随 web-app bundled 分发到桌面端运行时，非仅构建机） |

## 挂载语义

`cordis.patch.yml` 注释说明：`dsh-better-sidebar` 自带的 bundle 补丁在 `better-sidebar-bundled` 行已挂载该包时会**回退**，因此「profile 同时把 `dsh-better-sidebar` 装成 bundle」的场景下也只会挂载一次。

## pnpm 补丁

`patches/dsh-better-sidebar@0.26.0.patch` 是 pnpm patch（`pnpm patch` 生成、`pnpm patch-commit` 应用），修改 `lib/index.js` 与 `lib/types/context-types.d.ts`：`inject` 数组及 `apply()` 内的 trustedHosts 读取从 `ctx.webRuntime` 改为 `ctx.webStartup`。这是为了兼容当前 `code` 分支的 DSH 服务拓扑（`webRuntime` 已被 `webStartup` 取代）。

## git 状态

已提交：`0c22e47018` / `acc18c8f0b`（登记见 `../.version.yaml` customizations）。2026-10-23 复核 code 快照工作区干净；原「未跟踪 / 未暂存」状态已过期。

## 升级注意

升级 `dsh-better-sidebar` 版本时：重新生成 pnpm 补丁（`pnpm patch dsh-better-sidebar@<new>` → 手工迁移 `webRuntime→webStartup` 改动 → `pnpm patch-commit`），并按序更新 `package.json` 版本号 → `patches/` 补丁文件名 → `pnpm-workspace.yaml` 的 `patchedDependencies` 键与 `minimumReleaseAgeExclude` 条目 → `runtime-patch-policy.ts` 白名单键（reason 保留 webStartup 判断）；改完跑 `pnpm install` + `pnpm run verify-cordis-config`。

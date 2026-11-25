# 插件预设（@nanmicoder/dsh-agent-teams 0.1.25）

> code 分支专属插件接入。登记处：`.guide_code/插件预设/`。
> 以 web-app bundled 依赖方式给 web profile 挂载第三方 AgentTeams 多智能体协作插件。

## 改动点

| 文件 | 改动 |
| :-- | :-- |
| `packages/bundle/web-app/package.json` | 新增依赖 `@nanmicoder/dsh-agent-teams: 0.1.25`（排在 `dsh-better-sidebar` 之后） |
| `packages/bundle/web-app/cordis.patch.yml` | 新增挂载行 `agent-teams-bundled`，config `{stateDir: .agent-teams, memberProvider: spawn}` |
| `patches/@nanmicoder__dsh-agent-teams@0.1.25.patch` | pnpm 补丁：给插件 package.json 增加 `"engines": {"dsh": "0.2.1-alpha.5"}` |
| `pnpm-workspace.yaml` | `patchedDependencies` 注册上述补丁；`minimumReleaseAgeExclude` 放行 `@nanmicoder/dsh-agent-teams@0.1.25`（同批另放行 0.2.1-alpha.5 系列包） |
| `apps/desktop/scripts/runtime-patch-policy.ts` | 白名单登记 `@nanmicoder/dsh-agent-teams@0.1.25`，`scope: shared` |

## engines 补丁原因

插件 peer 只声明到 dsh `0.2.1-rc.2`，而本仓库运行时是 `0.2.1-alpha.5`（含 rc 之后的语义），compat 门禁会因此禁用挂载行。pnpm 补丁把 `engines.dsh` 放宽到 `0.2.1-alpha.5`，runtime-patch-policy 白名单的 reason 字段同步记录了这条判断，使挂载行在打包运行时保持启用。

## scope: shared 含义

插件随 web-app bundled 分发到桌面端运行时（非仅构建机），故白名单 scope 用 `shared` 而非默认的构建机范围。

## 状态目录

`stateDir: .agent-teams`：团队计划、任务板、成员会话状态落在各工作区的 `.agent-teams/`（该目录已随接入进入相关忽略规则）。

## git 状态

已提交：`01812a8412`（feat: 接入 @nanmicoder/dsh-agent-teams（web-app bundled 挂载 + patch 白名单），2026-10-20）。5 个文件一次性原子提交：依赖、挂载行、pnpm 补丁、workspace 白名单、runtime 白名单。

## 升级注意

升版本时按序更新：`package.json` 版本号 → `patches/` 补丁文件名与内容（engines.dsh 对齐新版本）→ `pnpm-workspace.yaml` 的 `patchedDependencies` 键与 `minimumReleaseAgeExclude` 条目 → `runtime-patch-policy.ts` 白名单键（reason 里写清 peer 上界与 engines 判断）→ `cordis.patch.yml` 一般不动。改完跑 `pnpm install` + `pnpm run verify-cordis-config`。

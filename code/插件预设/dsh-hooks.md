# 插件预设（dsh-hooks 0.14.4）

> code 分支专属插件接入。登记处：`.guide_code/插件预设/`。
> 用外部插件 `dsh-hooks` 给 web profile 挂载配置驱动的生命周期 hooks 引擎：在 profile 的 `cordis.patch.yml` 直接声明「事件 → 命令/通知」，不写插件代码。

## 改动点

| 文件 | 改动 |
| :-- | :-- |
| `packages/bundle/web-app/package.json` | 新增依赖 `dsh-hooks: 0.14.4`（第 187 行，排在 `@nanmicoder/dsh-agent-teams` 之后） |
| `packages/bundle/web-app/cordis.patch.yml` | 新增挂载行 `- id: dsh-hooks / name: 'dsh-hooks'`（第 324–325 行；id 选择理由见第 318–323 行注释） |

**无需另改的三处**：`patches/` 没有 dsh-hooks 补丁，因此 `pnpm-workspace.yaml`（`patchedDependencies` / `minimumReleaseAgeExclude`）与 `apps/desktop/scripts/runtime-patch-policy.ts` 白名单也都**没有** dsh-hooks 条目——这是预期状态、不是漏登（对比 better-sidebar / agent-teams 均有 pnpm 补丁，所以那三处齐全）。

## 挂载语义（与另两个插件的差别）

- **同**：随 web-app bundled 依赖分发，同 `better-sidebar-bundled` / `agent-teams-bundled` 模式。
- **异**：插件自带 bundle 补丁（其 `package.json` → `dsh.bundle.patch: ./cordis.patch.yml`），会**无条件插入同名 `dsh-hooks` 行**；所以本行**复用 `dsh-hooks` 作为 id**——profile 若另装 dsh-hooks bundle，按 id 覆盖本行而非二次挂载（另两个插件用 `-bundled` 后缀 id 区分，正是为此）。
- **hook 定义不进 bundle**：bundle 只带引擎；具体 hook 写在各 profile 自己 `cordis.patch.yml` 的 `id: dsh-hooks` 配置块（插件 README.zh.md 有模板）。

## 插件能力速记

- **事件**：内置 18 类生命周期事件（`turn/start`、`turn/end`、`step/end`、`tool/call`、`user/message`、`approval/*`，以及合成事件 `tree/settled` / `hook/failed` / `usage/daily` 等），支持 `when` / `match` 过滤（正则与数值比较如 `'>10000'`）、`debounceMs` 去抖、opt-in `retries`、`maxConcurrent`；hook 经 stdin 收事件 JSON。
- **动作**：`run` 执行命令，或 `notify`（webhook / desktop / feishu 扫码凭据）。
- **CLI**（bin `dsh-hooks`）：`dsh-hooks tail` 实时跟踪执行，`dsh-hooks dry-run <event>` 模拟事件验证配置（直接读 profile 配置块）。
- **执行历史**：`~/.dsh/dsh-hooks/history.jsonl`（0600；内存环形缓冲 500 条 + 磁盘 best-effort 追加，超 2 MB 压缩）。Web 设置面板带 hook 编辑器与历史时间线，对应其 `dsh.client.inject` → `dsh-client-ui-settings` / `dsh-client-ui-renderer`（platform web）。
- **依赖特征**：pnpm-lock 解析出 `@larksuiteoapi/node-sdk`（飞书通知）与 `qrcode`（扫码凭据）。

## git 状态

接入随 code 快照仓的初始提交 `53181aa024b`（2026-10-22 22:35，「恢复快照——.git 丢失后重建」）入库；原 master_code 历史随 `.git` 重建丢失，**原始接入提交号不可考**。2026-10-23 复核快照工作区干净（已提交）。本条为 2026-10-23 补录：`.version.yaml` 2026-10-20 实测登记的 5 项定制里没有它。

## 升级注意

升版本只改 `package.json` 版本号——无补丁要重建、无白名单要登记；若新版本发布过新被 pnpm `minimumReleaseAge` 拦截，再往 `pnpm-workspace.yaml` 的 `minimumReleaseAgeExclude` 放行（better-sidebar / agent-teams 即此模式）。peer 上界：`@deepseek-ai/cordis ^4.0.4`、`@deepseek-ai/dsh-session ^0.2.0-rc.2`（lock 实测解析）；跨出该上界时留意 compat 门禁会禁用挂载行（同 agent-teams 的 engines 问题，但本插件目前不需要补丁）。

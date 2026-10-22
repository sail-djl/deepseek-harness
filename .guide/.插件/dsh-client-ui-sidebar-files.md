# dsh-client-ui-sidebar-files 插件

## 1. 目录

- [2. 插件定位](#2-插件定位)
- [3. 核心能力](#3-核心能力)
- [4. 注册与插槽](#4-注册与插槽)
- [5. 挂载与配置](#5-挂载与配置)
- [6. 依赖关系](#6-依赖关系)
- [7. 源码地图](#7-源码地图)
- [8. 已知限制](#8-已知限制)
- [9. 相关文档](#9-相关文档)

## 2. 插件定位

`@deepseek-ai/dsh-client-ui-sidebar-files` — dsh Web 客户端右侧 Sidebar 的「文件」tab 类型。以 Session 的工作目录为根，经 `workspaceFiles` Remote 命名空间逐层懒加载目录树，并把文件打开到该 tab 自己的面板。它是页面型 tab（不认领资源地址），文件由 `dsh-resource://file` 查看器接单。

| 项 | 说明 |
|:--|:--|
| ⭐ 包名 | `@deepseek-ai/dsh-client-ui-sidebar-files`（v0.2.1-alpha.2，MIT） |
| ⭐ 源码 | `packages/client/ui-sidebar-files/` |
| ⭐ tab 类型 | kind `files`，id `@deepseek-ai/dsh-client-ui-sidebar-files`，档位 `builtin` |
| ⭐ 平台 | `web`（`dsh.client.platform`）；纯浏览器实现，Host 半为空 |

## 3. 核心能力

| 能力 | 说明 |
|:--|:--|
| ⭐ 目录树 | 以 Session 工作目录（`useSessions().byId[sessionId].cwd`）为根，`/` 与 Windows 盘根亦可作根 |
| ⭐ 懒加载列目录 | 一层首次展开时经 `remote.workspaceFiles.list(sessionId, absolutePath)` 拉取，适配器只保留条目与截断标志 |
| ⭐ 打开文件 | 经 `useTabInfo().tab.actions.openResource` 打开 `dsh-resource://file/session/<sessionId>/<相对路径>`，地址由 `fileAddressFor` 生成 |
| 自动刷新 | 每个打开的 `DirectoryNode` 持有一条目标监听，目录变更即重读；默认开启 |
| 状态保活 | `root`/`levels`/`expanded`/`autoRefresh`/`scrollTop` 存于按 tab 分桶的 store，切换到其他侧栏 tab 再切回时原样恢复 |
| 行排序 | 目录优先，其后按自然序、不分大小写的名称排列；dotfiles 与其他条目一样显示 |
| 快捷键 | 命令 `workspace.files` 在焦点分栏打开/聚焦文件页，桌面默认 Mod+P |
| 只读呈现 | 被截断、空目录、失败三种情况各以一行说明收尾，失败按错误码区分 |

## 4. 注册与插槽

两段注册，均由 `FILES_ID` 作为键：

| 注册项 | 目标 | 说明 |
|:--|:--|:--|
| ⭐ 类型 | `ctx.sidebarRightTabs.register(filesDefinition(t))` | kind `files`，优先级 `builtin`，无 patterns；带一条引导页入口（`commandId: workspace.files`，order 10，图标 `GuideArtworkFiles` 黄色文件夹） |
| ⭐ 正文 | 键 `sidebar.right.pane.tab`，key = `FILES_ID` | 标题行 + 树；声明子 seek `sidebar.right.tab.files.actions`（kind `list`、scope `session`、`owner.absolutePath`） |
| 标签标题 | 键 `sidebar.right.pane.tab.title`，key = `FILES_ID` | 类型标签前的 16px 共享 `FileTypeIcon` folder 图标 |
| 字典 | `ctx.locale.register('sidebarFiles', { zh, en })` | `sidebarFiles` 命名空间中英文字典 |
| 命令 | 注入 `shortcuts` 后注册 `workspace.files` | 各 tab 插件自行负责命令的可用性、本地化拒绝与 tab kind |

- 正文标题行：共享 `PathLabel` 显示根路径，右侧为重新读取控件与 `sidebar.right.tab.files.actions` 列表（`ui-open-in-app` 在此提供工作区目录打开按钮）
- owner 的 `signal` 终结一个桶：中止时忘掉该 tab，其后结算的列表与卸载时的偏移提交都不写入
- 自动刷新开关当前包在 `<span hidden>` 内（状态、文案、样式、切换逻辑均保留）

## 5. 挂载与配置

该包随 Web 客户端一起加载，通过 `package.json` 的 `dsh.client` 声明：

```json
"dsh": {
  "client": {
    "inject": [
      "@deepseek-ai/dsh-api-workspace-files",
      "@deepseek-ai/dsh-client-ui-sidebar-right",
      "@deepseek-ai/dsh-client-ui-session",
      "@deepseek-ai/dsh-api-remotes",
      "@deepseek-ai/dsh-client-shortcuts"
    ],
    "platform": "web"
  }
}
```

| 项 | 值 | 含义 |
|:--|:--|:--|
| ⭐ 浏览器注入服务 | `inject` 数组 | `slots`、`locale`、`sidebarRightTabs`、`sidebarRight`、`remote`、`remote.workspaceFiles` |
| ⭐ `platform` | `web` | 仅浏览器半参与构建 |
| 快捷键默认键 | 见下表 | 命令 `workspace.files` 的平台默认绑定 |

| 平台 | 默认键 |
|:--|:--|
| `desktop:macos` / `desktop:windows` / `desktop:linux` | Mod+P |
| `web:macos` / `web:windows` | Mod+Alt+P |
| `web:linux` | 不绑定 |

- 本包无自定义配置字段

## 6. 依赖关系

**peer 依赖**（workspace）：`@deepseek-ai/cordis`

**运行时引用**（devDependencies，workspace）：
`@deepseek-ai/dsh-api-remotes`、`@deepseek-ai/dsh-api-workspace-files`、`@deepseek-ai/dsh-client-locale`、`@deepseek-ai/dsh-client-shortcuts`、`@deepseek-ai/dsh-client-store`、`@deepseek-ai/dsh-client-ui-dockkit`、`@deepseek-ai/dsh-client-ui-primitives`、`@deepseek-ai/dsh-client-ui-renderer`、`@deepseek-ai/dsh-client-ui-session`、`@deepseek-ai/dsh-client-ui-sidebar-right`、`@deepseek-ai/dsh-client-ui-slots`、`@deepseek-ai/dsh-session`、`@deepseek-ai/dsh-typert-protocol`、`@deepseek-ai/dsh-util-workspace-path`

**外部依赖**：`react` / `react-dom` ^18、`clsx` ^2

## 7. 源码地图

| 文件 | 职责 |
|:--|:--|
| ⭐ [`src/index.ts`](../../packages/client/ui-sidebar-files/src/index.ts) | Host 半：空实现，不向 Host 插件树贡献任何内容 |
| ⭐ [`src/client/index.ts`](../../packages/client/ui-sidebar-files/src/client/index.ts) | 浏览器入口，仅接线：命令、类型、字典、正文、标题 |
| [`src/client/definition.tsx`](../../packages/client/ui-sidebar-files/src/client/definition.tsx) | 类型是什么：id / kind / priority / 引导页入口，导出 `FILES_KIND`、`FILES_ID` |
| [`src/client/store.ts`](../../packages/client/ui-sidebar-files/src/client/store.ts) | 保存什么：按 tab 分桶的 `root` / `levels` / `expanded` / `autoRefresh` / `scrollTop` |
| [`src/client/face.ts`](../../packages/client/ui-sidebar-files/src/client/face.ts) | Remote 读取与监听：`createList` / `createWatch` / `filesFace` / `childPath` |
| [`src/client/directory-node.ts`](../../packages/client/ui-sidebar-files/src/client/directory-node.ts) | 打开的目录及其生命周期：expand / collapse / refresh / close |
| [`src/client/FilesBody.tsx`](../../packages/client/ui-sidebar-files/src/client/FilesBody.tsx) | 画什么：树正文，含 `orderEntries` 排序与 `failureLine` 失败行 |
| [`src/client/FilesTitle.tsx`](../../packages/client/ui-sidebar-files/src/client/FilesTitle.tsx) | 标签页标题：folder 图标 + 标题文本 |
| [`src/client/locales.ts`](../../packages/client/ui-sidebar-files/src/client/locales.ts) | 说什么：`sidebarFiles` 命名空间中英文字典与 key 集 |
| `tests/*.spec.ts(x)` | 各模块单测（apply / definition / directory-node / face / body / title / store / watch） |

## 8. 已知限制

| 限制 | 说明 |
|:--|:--|
| ⭐ 只有列目录 | 无搜索、产物过滤、拖拽、重命名、右键菜单或当前文件高亮 |
| ⭐ 只有一个根 | 树以会话工作目录为根，无法浏览到它之上；Host 亦拒绝工作区根之外的路径 |
| 自动刷新开关隐藏 | 状态、文案、样式与切换逻辑保留，UI 暂隐藏 |
| Host 半为空 | 该包在浏览器里绘制文件树，不注册任何面向模型的内容 |
| 平台差异 | Linux Web 默认不绑定 `workspace.files` 快捷键 |

## 9. 相关文档

| 文档 | 说明 |
|:--|:--|
| [sidebar-right 子系统](../../docs/subsystems/sidebar-right.zh.md) | 右侧栏 tab 机制与 seat |
| [ui-sidebar-right 包](../../packages/client/ui-sidebar-right/README.zh.md) | tab 注册表与停靠分栏 |
| [ui-open-in-app 包](../../packages/client/ui-open-in-app/README.zh.md) | 工作区目录打开动作（本 tab 的 actions） |
| [shortcuts 包](../../packages/client/shortcuts/README.zh.md) | 命令与平台默认键 |
| [ui-primitives 包](../../packages/client/ui-primitives/README.zh.md) | `PathLabel`、`FileTypeIcon` 等共享组件 |
| [ui-slots 包](../../packages/client/ui-slots/README.zh.md) | slot 注册与 Locale 命名空间约定 |
| ⭐ [README.zh.md](../../packages/client/ui-sidebar-files/README.zh.md) | 权威来源 |

- 版本：v0.2.1-alpha.2
- 日期：2026-10-14

## 更新记录

| 日期 | 位置 | 动作 | 原因 | 口径说明 |
| :--- | :--- | :--- | :--- | :--- |
| 2026-10-14 | 全文 | 新增 | 首次生成插件文档 | 依据 `packages/client/ui-sidebar-files/` 源码与 README.zh.md；版本取自 package.json |

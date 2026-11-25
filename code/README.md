# .guide_code — code 专属内容登记处

> `dsharnesscode`（deepseek-harness 的 `code` 分支工作副本）中，**凡本仓库 / 本分支专属的 guide 内容，统一登记在本目录**，不散落到 `.guide/`。

## 为什么分两个目录

| 目录 | 职责 | 来源 | 可否被同步覆盖 |
|:--|:--|:--|:--|
| `.guide/` | 共享 guide 内容（只读镜像） | 从 guide 仓 `master-guide` 分支 git 同步（源头 `E:\baizhoucode\companyagent\dsharnessguide`） | **会**——每次同步整目录镜像覆盖 |
| `.guide_code/` | code 分支 / 本仓库专属内容 | 本仓库自行维护 | **不会**——同步流程不触碰本目录 |

这样设计的原因：`.guide/` 是从 guide 分支整目录镜像同步过来的共享副本，内容随时可能被上游覆盖；而 code 分支的版本追踪、定制记录等**只属于本仓库**，一旦混进 `.guide/` 就会在下次同步时被抹掉。因此专属内容一律放在 `.guide_code/`，与共享副本物理隔离。

## 本目录结构（按定制类别分文件夹）

| 位置 | 内容 | 当前状态 |
|:--|:--|:--|
| `.version.yaml` | code 分支版本追踪：`role: code 分支工作副本`、相对上游 `master` 的 `sync` 状态（behind/ahead）、`customizations` 本地定制清单 | 已登记 2 项定制 |
| `agent预设/` | code 专属 Agent 预设 → `百洲-agent预设.md`（bzcode / bzcode-haiyu / bzcode-shuili，落点 `packages/bundle/web-app/presets/`） | 已登记 |
| `插件预设/` | code 专属插件替换 → `dsh-better-sidebar.md`（外部插件替换 `ui-sidebar-files` + pnpm 补丁） | 已登记 |
| `mcp/` | code 专属业务 MCP 清单 → `业务-mcp清单.md`（海渔 16 个 / 水利 6 个，内嵌在 haiyu/shuili 预设里，不含明文账密） | 已登记 |
| `skill/` | code 专属 skill → `skill-预设.md` | 暂无专属定制（仅引用上游内置 skill），留作登记槽位 |
| `README.md` | 本说明 | — |

后续新增的 code 独有场景文档、code 分支专属的部署/定制笔记等，也一律登记到对应类别文件夹下。

## 共享内容同步流程（重要，2026-10-22 起 git 化）

guide 仓 `master-guide` 分支 → 本仓 `.guide/` 的同步走 git 整目录镜像（取代原 robocopy 本地镜像方式）：

```powershell
$guide='E:\baizhoucode\companyagent\dsharnessguide'
git -C E:\baizhoucode\companyagent\dsharnesscode fetch $guide master-guide
git rm -r .guide                                  # 整目录移除，保证镜像无旧布局残留
git checkout FETCH_HEAD -- .guide                 # 与 guide 分支逐字节一致
git diff FETCH_HEAD -- .guide                     # 应为空 = 镜像一致
git commit -m 'perf guide 同步：整目录镜像对齐 guide 分支最新；'
```

> 两个目录均已纳入 `master_code` 版本跟踪；同步只覆盖 `.guide/`，永不触碰 `.guide_code/`。code 独有内容混入 `.guide/` 会被下次同步覆盖——一律登记到 `.guide_code/`。

## 维护约定

- **code 专属 → 写 `.guide_code/`**；共享内容 → 写 `dsharnessguide` 仓库，再同步过来。
- `.version.yaml` 中的 `checked_at` / `sync` / `customizations` 在每次同步或升级后更新。
- 版本明细（每个版本一个 md）仍在 guide 仓库 `.guide/.version/`，本目录只保留指向 code 分支状态的追踪。

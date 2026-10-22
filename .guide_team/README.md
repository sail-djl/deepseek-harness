# .guide_team — team 专属内容登记处

> `dsharnessteam`（deepseek-harness 的 `team` 分支工作副本）中，**凡本仓库 / 本分支专属的 guide 内容，统一登记在本目录**，不散落到 `.guide/`。
> 定位与 `dsharnesscode\.guide_code`、`dsharnesswork\.guide_work` 同构（双 guide 目录机制）。

## 为什么分两个目录

| 目录 | 职责 | 来源 | 可否被同步覆盖 |
|:--|:--|:--|:--|
| `.guide/` | 共享 guide 内容（只读镜像） | 从 guide 仓 `master-guide` 分支 git 同步（源头 `E:\baizhoucode\companyagent\dsharnessguide`） | **会**——每次同步整目录镜像覆盖 |
| `.guide_team/` | team 分支 / 本仓库专属内容 | 本仓库自行维护 | **不会**——同步流程不触碰本目录 |

team 独有内容一旦混进 `.guide/` 就会在下次同步时被抹掉，因此一律放本目录，与共享副本物理隔离。

## 本目录内容

| 位置 | 内容 | 状态 |
|:--|:--|:--|
| `1 开始.md` | team 分支入口 | 已登记 |
| `本地启动.md` | 本地启动说明 | 已登记 |
| `.配置.md` | 配置说明 | 已登记 |
| `架构/` | 架构文档 | 已登记 |
| `resources/` | 资源与脚本 | 已登记 |
| `.account.txt` | 账号登记（本分支专用） | 已登记 |
| `README.md` | 本说明 + 机制登记 | 登记于 2026-10-22 |

后续新增的 team 独有场景文档（预设、MCP、skill、部署笔记等）按类别建文件夹登记，命名对齐 `.guide_code` / `.guide_work`。

## 共享内容同步流程（双 guide 目录机制）

```powershell
$guide='E:\baizhoucode\companyagent\dsharnessguide'
git -C E:\baizhoucode\companyagent\dsharnessteam fetch $guide master-guide
git rm -r .guide                                  # 整目录镜像覆盖（首次无 .guide 时跳过）
git checkout FETCH_HEAD -- .guide                 # 与 guide 分支逐字节一致
git diff FETCH_HEAD -- .guide                     # 应为空 = 镜像一致
git commit -m 'perf guide 同步：.guide 对齐 guide 分支最新；'
```

> 两个目录均已纳入 `team` 分支版本跟踪（2026-10-22 起）；同步只覆盖 `.guide/`，永不触碰 `.guide_team/`。

## 维护约定

- **team 专属 → 写 `.guide_team/`**；共享内容 → 写 guide 仓（`dsharnessguide` 的 `master-guide` 分支），再 git 同步过来。
- 同步只覆盖 `.guide/`，永不触碰 `.guide_team/`。
- 新增专属文档按类别建文件夹，保持与 `.guide_code` / `.guide_work` 同构。

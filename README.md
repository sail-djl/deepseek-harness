# doc 分支 —— 规范文档登记中心

> 定位：**只管规范与文档，不承载业务代码，也不直接替代各仓库中实际加载的 Skill 执行文件。**
> 分支关系：`doc` 与 `master`（代码基线）互不合并；`master-guide` 分支保留在 origin（检出已移除），`doc` 是 guide 文档的唯一维护点。
> 本地检出于 `.guide/`（`.master` 仓库的 `doc` 分支 worktree）。

## 目录结构

| 目录/文件 | 定位 | 内容来源 |
|:--|:--|:--|
| `guide/` | 通用规范（Git、Worktree、分支管理、Agent 协作、集成流程） | 收编自 `master-guide` 分支 `.guide/.guide/`（49 文件） |
| `guide_code/` | code 定制版本的差异与约束 | 收编自 `code/.guide_code/`（7 文件） |
| `guide_team/` | team 定制版本的差异与约束 | 收编自 `team/.guide_team/`（8 文件） |
| `guide_work/` | work 定制版本的差异与约束 | 收编自 `work/.guide_work/`（1 文件） |
| `README.md` | 文档索引与管理规则 | 本文件 |

## 管理规则

1. **分支职责**：`doc` 是文档登记中心，只维护文档目录；不存放业务代码、不与 `master` / `customer/*` 分支互相合并。
2. **差异维护**：通用规范只在 `guide/` 维护一份；各定制版本只在自己的 `guide_*` 目录记录差异，避免多处重复维护同一套规则。
3. **文档与执行文件分离**：本分支文件仅供人与 Agent **查阅**；Agent 实际加载的 `SKILL.md`、脚本、配置等执行文件在各自 skill 仓库，提交到 `doc` 分支不会被自动加载。
4. **唯一维护点**：首轮以复制方式收编后，各源目录（`code`/`team`/`work` 的 `.guide*`、`master-guide` 检出）已于 2026-10-23 移除，guide 文档只在本分支维护。
5. **更新流程**：修改 → 提交（`docs(guide): ...`，沿仓库惯例）→ 默认不推送，推送需单独确认。

## 与相邻分支/目录的关系

| 名称 | 性质 | 与 `doc` 的关系 |
|:--|:--|:--|
| `master` | 代码基线分支 | 互不合并；`doc` 不随代码基线同步（必要时人工评估） |
| `master-guide` | guide 文档体系（历史分支） | 分支保留在 origin（`eb9af801f5`），本地检出已移除；`doc` 延续其内容并成为唯一维护点 |
| `customer/baizhou_code` / `_team` / `_work` | 定制版本业务分支 | 互不合并；原 `.guide*` 内容已收编至本分支并从主分支移除 |
| `.worktrees/` | 任务层（AI Agent 临时 Worktree） | 与 `doc` 分支无关 |

---

创建：2026-10-23。用户拍板：orphan 独立分支 / `master-guide` 版本为 `guide/` 来源。
同日演进：三定制仓库主分支移除 `.guide*` 文件、`master-guide` 检出移除、`.doc` 检出改名为 `.guide`，本分支成为 guide 文档唯一维护点。

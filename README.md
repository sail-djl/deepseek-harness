# doc 分支 —— 规范文档登记中心

> 定位：**只管规范与文档，不承载业务代码，也不直接替代各仓库中实际加载的 Skill 执行文件。**
> 分支关系：`doc` 与 `master`（代码基线）、`master-guide`（guide 文档体系）并存，互不合并。

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
4. **收编方式**：首轮为**复制**收编，源仓库（`code`/`team`/`work`、`master-guide`）的文件一律不动；后续更新以源为准还是反向回写，按次确认。
5. **更新流程**：修改 → 提交（`docs(guide): ...`，沿仓库惯例）→ 默认不推送，推送需单独确认。

## 与相邻分支/目录的关系

| 名称 | 性质 | 与 `doc` 的关系 |
|:--|:--|:--|
| `master` | 代码基线分支 | 互不合并；`doc` 不随代码基线同步（必要时人工评估） |
| `master-guide` | guide 文档体系（整仓库检出） | 并存：文档源；`doc` 是其通用文档的登记副本 |
| `customer/baizhou_code` / `_team` / `_work` | 定制版本业务分支 | 互不合并；`guide_*` 差异收编自各定制仓库 |
| `.worktrees/` | 任务层（AI Agent 临时 Worktree） | 与 `doc` 分支无关 |

---

创建：2026-10-23。用户拍板：orphan 独立分支 / `master-guide` 版本为 `guide/` 来源 / 与 `master-guide` 并存。

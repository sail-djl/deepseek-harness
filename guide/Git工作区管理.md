# Git 工作区管理（dsharness 专属映射）

> 本文件是本工作区「仓库 → 角色 → 目标业务分支」的唯一映射表，配合 `git-worktree-manager` skill 使用；创建任务 Worktree 前先查本表。规则本体见 skill 的 `rules.md` / `knowledge/目录规范.md`。

---

## 工作区角色映射

| 目录 | 角色 | 目标业务分支 | Remote | 说明 |
|:--|:--|:--|:--|:--|
| `.master/` | 基线仓库（baseline） | `master` | origin（fork）+ upstream（官方） | 跟踪官方 deepseek-ai/deepseek-harness，只承载公共基线；不做业务定制、不承接业务任务 |
| `code/` | 定制版本（custom） | `customer/baizhou_code` | origin（fork） | code 场景定制版，长期维护 |
| `team/` | 定制版本（custom） | `customer/baizhou_team` | origin（fork） | team 场景定制版，长期维护 |
| `work/` | 定制版本（custom） | `customer/baizhou_work` | origin（fork） | work 场景定制版，长期维护 |
| `.guide/` | 文档检出（doc 分支） | `doc` | origin（fork） | `doc` 分支的 worktree 检出，guide 文档唯一落点；目录结构见下「文档落点」 |
| `.worktrees/` | 任务层 | —（任务分支临时存在） | — | 各仓库任务 Worktree 统一存放于 `.worktrees/{仓库}/task-{序号}-{短名}/` |

官方仓库：`https://github.com/deepseek-ai/deepseek-harness.git`（upstream）
Fork：`https://github.com/sail-djl/deepseek-harness.git`（origin）

### 文档落点

- guide 文档只在 **`doc` 分支** 维护：通用规范 `guide/`，定制差异 `guide_code/` / `guide_team/` / `guide_work/`，本地检出于 `.guide/`（`.master` 仓库的 `doc` 分支 worktree）。
- 主分支不再放 guide 文件：`code` / `team` / `work` 的 `.guide*` 目录已于 2026-10-23 移除（提交 `ead6c904038` / `3e5c8de826` / `8cdcec3ec3`），内容已全量收编进 `doc` 分支。
- `master-guide` 分支保留在 origin（`eb9af801f5`），本地检出已移除，不再作为文档工作区。

---

## 任务分支命名

- 任务目录：`.worktrees/{仓库}/task-{序号}-{短名}`（如 `.worktrees/code/task-001-sidebar`）
- 任务分支：`task/{序号}-{短名}`（如 `task/001-sidebar`）
- 序号按**所属仓库各自计数**：`code` 的 001 与 `team` 的 001 互不冲突
- 任务分支是临时分支，随 CLEANED 删除；已合并历史保留在所属仓库

---

## 核心约束

1. **三层职责互不替代**：`.master` 是基线不是任务开发区；定制版本互不合并、不重构为一个仓库；Worktree 不是长期分支或新基线。
2. **一任务归属一个仓库**：从业务/文档仓库的目标业务分支切出 Worktree，合并回同一仓库同一分支，禁止跨仓库合并。
3. **不默认下发基线更新**：官方更新先同步 `.master`，再逐个评估定制版本差异，按需下发并验证。

---

## 两条独立流程

**任务流**：选择定制版本 → 从目标业务分支创建 Worktree → Agent 并行开发 → 合并前安全检查（Diff/测试/敏感文件/基点/规范/记录 6 项）→ 合并回目标业务分支 → 合并后安全检查（构建回归/SHA 留痕）→ 清理 Worktree 与任务分支。

**上游流**：`git fetch upstream` → 同步 `.master` 基线并验证 → 逐个评估 `code/team/work` 差异 → 按需下发（merge/cherry-pick，策略人工确认）→ 各仓库验证 → 记录结果。

流程细节与安全检查清单见 `git-worktree-manager` skill 的 `scenes/集成合并.md`、`scenes/上游同步.md`、`scenes/任务清理.md`。

---

## 维护说明

- 本映射表变化（新增定制版本、调整目标业务分支）时更新本文件，并同步 skill `decisions.md` 的对应决策状态。
- 本文档由 2026-10-23 的架构确认产生（三层职责模型 + `.guide` 定性 + 命名方案 + 上游同步场景，用户逐条确认）。
- 2026-10-23 同日演进：建立 `doc` 分支并收编全部 guide 文档 → 三定制仓库主分支移除 guide 文件 → `master-guide` 检出移除（分支保留在 origin）→ `.guide/` 改为 `doc` 分支检出（原 `.doc` 目录改名）。

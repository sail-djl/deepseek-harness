# Skill 预设（code 分支专属 skill）

> 登记处：`.guide_code/skill/`。

## 当前状态：暂无专属定制

`dsharnesscode`（`code` 分支）目前**没有分支专属的自定义 skill**。

- 三个 bzcode agent 预设只引用上游内置 skill：`skill-filesystem`（`@deepseek-ai/dsh-skill-filesystem`）与 `tool-skill`（`@deepseek-ai/dsh-tool-skill`）。
- `packages/skill/` 下的 `skill` / `skill-filesystem` / `skill-office` / `tool-skill` / `tool-workspace-dependencies` 均为上游包，非本地定制。
- 仓库无 `.dsh/skills/`、`custom/`、`skills/` 等本地 skill 目录。

## 后续新增专属 skill 时的登记约定

若日后加入 code 分支专属 skill（如百洲业务 skill），在此目录下新增对应文档，登记：

1. skill 名称与落点目录（如 `packages/bundle/web-app/skills/<name>/` 或 `.dsh/skills/<name>/`）
2. 是否被某个 agent 预设引用（`skill-filesystem` / `tool-skill` 之外新增的行）
3. `web-app/package.json` 的 `files` / `exports` 是否需追加
4. git 状态（新增文件通常不与 master 合并冲突）

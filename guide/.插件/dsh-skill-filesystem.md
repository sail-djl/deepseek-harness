# dsh-skill-filesystem 插件

## 1. 目录

- [2. 插件定位](#2-插件定位)
- [3. 核心能力](#3-核心能力)
- [4. skill 根目录与优先级](#4-skill-根目录与优先级)
- [5. 挂载与配置](#5-挂载与配置)
- [6. 依赖关系](#6-依赖关系)
- [7. 源码地图](#7-源码地图)
- [8. 已知限制](#8-已知限制)
- [9. 相关文档](#9-相关文档)

## 2. 插件定位

`@deepseek-ai/dsh-skill-filesystem` — 本地文件系统 skill 提供方。发现、解析并监视磁盘上的本地 skill（项目 / 自定义 / 用户根目录），使新增、改名、删除的 skill 无需重启即可进入下一次会话目录。

| 项 | 说明 |
|:--|:--|
| ⭐ 包名 | `@deepseek-ai/dsh-skill-filesystem`（v0.2.1-alpha.2，MIT） |
| ⭐ 源码 | `packages/skill/skill-filesystem/` |
| ⭐ 提供方名 | `filesystem`（注册到 `ctx.skills`） |
| 依赖注册表 | `@deepseek-ai/dsh-skill`（注册表接受任意提供方，本包只是磁盘实现） |

## 3. 核心能力

| 能力 | 说明 |
|:--|:--|
| ⭐ 目录发现 | 扫描各 skill 根目录顶层，识别目录 bundle `<name>/SKILL.md` 与平铺文件 `<name>.md`（不支持嵌套 `**/SKILL.md`） |
| ⭐ frontmatter 解析 | 必填 `name`（kebab-case）与 `description`；可选 `whenToUse`、`metadata`、`disable-model-invocation`、`user-invocable` |
| 热更新监视 | Chokidar 深度 1 监视现有根；缺失根用 `fs.watchFile` 逐路径段轮询探测 |
| 同步失效 | 第一方 `write`/`edit` 工具命中受监视 skill 时直接使提供方失效，模型无需等 watcher |
| 目录与正文分离 | 发现阶段只解析 frontmatter，加载时重读当前文件——编辑正文无需缓存失效 |

## 4. skill 根目录与优先级

| Rank | 来源 | 路径 |
|:--|:--|:--|
| ⭐ 100 | `project-dsh` | `<projectRoot>/.dsh/skills` |
| ⭐ 200 | `project-agents` | `<projectRoot>/.agents/skills` |
| 300 | `custom` | `Config.customSkillDirs` |
| 400 | `user-dsh` | `<dshHome>/skills`（跳过 `.system`） |
| 500 | `user-agents` | `<agentsHome>/skills` |
| 600 | `bundledSkillDir` | 随包提供（配置后才扫描） |

- 项目根 = 包含 `.git` 的最近祖先；无 `.git` 时回退 cwd

## 5. 挂载与配置

与 skill 注册表一起加载，依赖 `ctx.skills`：

```yaml
- name: '@deepseek-ai/dsh-skill'
- name: '@deepseek-ai/dsh-skill-filesystem'
```

| 字段 | 默认值 | 含义 |
|:--|:--|:--|
| ⭐ `providerName` | `filesystem` | 注册到 `ctx.skills` 的提供方名 |
| `includeDefaultRoots` | `true` | 是否在 `customSkillDirs` 周围包含项目根与用户根 |
| ⭐ `dshHome` | `$DSH_HOME` 或 `~/.dsh` | Harness 配置根，扫描其 `skills` 子目录 |
| `agentsHome` | `$DSH_AGENTS_HOME` 或 `~/.agents` | 共享 agent 配置根 |
| `customSkillDirs` | `[]` | 额外本地 skill 根（位于项目根之后、用户根之前） |
| ⭐ `watch` | `true` | 监视本地根并在目录变化时失效 |
| `bundledSkillDir` | — | 随包 skill 根（rank 600） |

其余 `watch*` 字段（轮询、稳定窗口、间隔、项目上限、符号链接跟随）真源见 [配置目录](../../docs/config-catalog.zh.md#deepseek-aidsh-skill-filesystem)。

## 6. 依赖关系

**peer 依赖**（workspace）：`@deepseek-ai/dsh-fs`、`@deepseek-ai/dsh-home-paths`、`@deepseek-ai/dsh-skill`、`@deepseek-ai/cordis`
**运行依赖**：`chokidar ^5`（文件监视）、`yaml ^2.4`（frontmatter 解析）、`@deepseek-ai/schemastery`（配置 schema）

## 7. 源码地图

| 文件 | 职责 |
|:--|:--|
| ⭐ [`src/index.ts`](../../packages/skill/skill-filesystem/src/index.ts) | 插件入口、提供方实现、根解析、frontmatter 解析、监视管理器 |
| `tests/skill-filesystem.spec.ts` | 发现/解析行为测试 |
| `tests/skill-filesystem-watcher.spec.ts` | 监视与失效测试 |

## 8. 已知限制

| 限制 | 说明 |
|:--|:--|
| ⭐ 发现深度为一层 | 只识别 `<root>/<name>/SKILL.md` 与 `<root>/<name>.md` |
| 项目范围仅最近 `.git` 祖先 | 不支持其他项目根标记或 monorepo 子项目选择 |
| 格式错误条目随警告消失 | 模型目录无法区分「缺失的 skill」与「无效的 skill」 |
| 缺失根轮询有界延迟 | 每次沿一个缺失路径段探测，直至 Chokidar 可附加 |
| 无正文修订协议 | 已加载正文属已保留工具历史，后续编辑只影响后续调用 |

## 9. 相关文档

| 文档 | 说明 |
|:--|:--|
| [skill 子系统参考](../../docs/subsystems/skills.zh.md) | 注册表约定与发现优先级 |
| [skill 注册表包](../../packages/skill/skill/README.zh.md) | 本提供方注册到的注册表 |
| [tool-skill 包](../../packages/skill/tool-skill/README.zh.md) | 已发现 skill 如何到达会话目录 |
| [home-paths 包](../../packages/util/home-paths/README.zh.md) | `dshHome` / `agentsHome` 解析 |
| ⭐ [README.zh.md](../../packages/skill/skill-filesystem/README.zh.md) | 权威来源 |

- 版本：v0.2.1-alpha.2
- 日期：2026-10-14

## 更新记录

| 日期 | 位置 | 动作 | 原因 | 口径说明 |
| :--- | :--- | :--- | :--- | :--- |
| 2026-10-14 | 全文 H2 | 修订 | 标题加序号 1-9（格式规范 §5.1） | — |
| 2026-10-14 | 各表格 | 修订 | 核心项加 ⭐ 标记（生成规范 §3.2） | — |
| 2026-10-14 | 第 8/9 章 | 修订 | 清单转表格（生成规范 §2.2） | — |
| 2026-10-14 | 第 1 章、文末 | 新增 | 补 TOC 目录（概览后）与版本/日期标记（生成规范 §1） | 版本取自 package.json |

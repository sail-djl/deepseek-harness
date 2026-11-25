# Agent Preset 架构

## Preset 是什么

Agent Preset 定义 Agent 的工具集、系统提示词和职责。位于 `apps/cli/config/agent-presets/`，通过 `agent.cordis.yml` 声明。

## 内置 Preset 一览

| Preset | 特性 | 实用工具 |
| :-- | :-- | :-- |
| `minimal` | 固定提示词 + 两工具 | bash/pwsh + str_replace_editor |
| `standard` | 完整编码 Agent | 全部工具 + plan + compaction |
| `cordis` | standard + 自修改运行时 | 全部 + tool-cordis + skill |
| `code` | standard + TypeScript 编排 | 全部 + tool-presentation |
| `my-agent` | 用户自定义模板 | 可变 |

## cordis.yml 的 id 语义

外层 yml 顶级是 patch 数组，每个 entry 有 `id`：

| 类型 | 特征 | 含义 |
| :-- | :-- | :-- |
| 插件 | `name: '@scope/pkg'` | 加载 npm 包 |
| group | `name: cordis:group` + `group: true` | 虚拟容器，包裹内部插件 |
| realm | `isolate: { term: true }` | 给内部插件共享作用域 |

**加载的插件数 = 所有非 group 的 `- id` 项**。

## Group 机制详解

Group（`name: cordis:group` + `group: true`）是 Cordis 的**虚拟容器**，核心作用是创建 **realm（隔离作用域）**。

### 为什么需要 group

Cordis 的 realm 决定服务注册和访问的范围：

| 场景 | 无 group | 有 group + isolate |
| :-- | :-- | :-- |
| 两个 preset 都注册 `terminals` 服务 | 根 realm 冲突 → `provide()` throw | 各自私有 realm → 互不干扰 |
| `persistent-bash` 使用 `pty` 注册的 terminals | 跨 realm 访问不到 | 同一 realm 内可见 |

原文（standard preset 注释）：

> A service row here MUST sit inside a group carrying an `isolate` realm.
> Without one it publishes into the root realm, where it is process-global —
> another preset publishing the same name collides.

### 有 vs 无 group

```yaml
# 无 group：pty 发布到根 realm → 进程全局，其他 preset 注册同名 terminals 会 throw
- id: pty
  name: '@deepseek-ai/dsh-terminal'

# 有 group：pty 发布到私有 realm → 仅本 preset 内可见
- id: persistent-shell
  name: cordis:group
  group: true
  isolate:
    terminals: true   # realm 名
  config:
    - id: pty
      name: '@deepseek-ai/dsh-terminal'
    - id: terminal-bash
      name: '@deepseek-ai/dsh-terminal-bash'
```

### isolate 的选择

| isolate | 用途 | 包含的子项 |
| :-- | :-- | :-- |
| `terminals: true` | PTY 终端隔离 | pty / terminal-bash / persistent-bash |
| `fs: true` | 文件系统隔离 | fs-local / str-replace-editor |
| `compaction: true` + `toolResultPruner: true` | 上下文压缩隔离 | compaction-basic / command-compact / tool-result-pruner |
| `workflowEngine: true` | 工作流引擎隔离 | subagent / workflow 工具集 |
| `planMode: true` | 计划模式隔离 | plan-mode |
| `isolate: { realm: true }` | 任意自定义 realm | 该组内的所有插件共享 |

### 无 isolate 的 group

仅做逻辑分组，不影响 realm。大多数 cordis:group 都带 isolate。

## minimal preset 示例

```yaml
- id: persona                 # ① 真实插件 (系统提示词)
  name: '@deepseek-ai/dsh-persona'
  config:
    text: You are a helpful software engineer assistant.
    complete: true            # 完整提示词，禁止其他文本注入
    includeRuntimeContext: false

- id: persistent-shell        # ② group 容器（不加载东西）
  name: cordis:group
  group: true
  isolate:
    terminals: true           # 共享终端 realm
  config:
    - id: pty                 # ③ 真实插件 (PTY 注册表)
      name: '@deepseek-ai/dsh-terminal'
    - id: terminal-bash       # ④ 真实插件 (Bash 后端)
      name: '@deepseek-ai/dsh-terminal-bash'
      disabled: !!js process.platform === 'win32'
    - id: persistent-bash     # ⑤ 真实插件 (Bash 持久工具)
      name: '@deepseek-ai/dsh-tool-bash-persistent'
    - id: terminal-pwsh       # ⑥ 真实插件 (PowerShell 后端, 复用同包)
      name: '@deepseek-ai/dsh-terminal-bash'
    - id: persistent-pwsh     # ⑦ 真实插件 (PowerShell 持久工具)
      name: '@deepseek-ai/dsh-tool-pwsh-persistent'

- id: filesystem              # ⑧ group 容器
  name: cordis:group
  group: true
  isolate:
    fs: true
  config:
    - id: fs-local            # ⑨ 真实插件 (本地文件系统)
      name: '@deepseek-ai/dsh-fs-local'
    - id: str-replace-editor  # ⑩ 真实插件 (编辑器)
      name: '@deepseek-ai/dsh-tool-str-replace-editor'
```

load 8 个 npm 包（2 个容器不算插件）。

## standard/cordis/code 关系

```
standard = 完整编码能力 (~15 工具)
  └─ 声明 persona, bash/pwsh, fs, jobs, goals, plan, compaction, delegation, ask-user, todo, web
    ↓ 衍生
cordis = standard + tool-cordis + editing-cordis-compositions skill
code   = standard + tool-presentation (mode: code)
```

## 加载位置

- **Shipped**：`config/agent-presets/`（随 cli 包发布，trust: system）
- **用户**：`$DSH_HOME/.agent-presets/<id>/`（可写）

加载由 profile-boot 的 `composeProfile` 注入 `agent-presets.config.roots`。

## 创建自定义 Preset

```bash
# 1. 复制 shipped preset 到用户目录
cp -r config/agent-presets/standard ~/.dsh/.agent-presets/my-variant/

# 2. 编辑 agent.cordis.yml 添加自己的 Skill/tool

# 3. 会话中选择该 preset
```

不要直接编辑 shipped preset — 升级会被覆盖。

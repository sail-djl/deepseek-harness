# standard — 标准模式

> 功能完整的编码 Agent，支持文件编辑、Shell、文件与网页检索、Skills、计划、目标、子代理和工作流。

## 工具集 (~23)

| 类别 | 工具 | 说明 |
| :-- | :-- | :-- |
| 身份 | persona, agent-instructions | 系统提示词 + 指令注入 |
| Shell | tool-bash (win32 禁用), tool-pwsh (非 win32 禁用) | 单次命令执行，平台自动切换 |
| 文件 | tool-fs, tool-fs-search | 读写文件 + 全局搜索 |
| 任务 | tool-jobs | 后台任务管理（启动/查询/停止） |
| 技能 | skill-filesystem, tool-skill | 本地技能发现 + 技能目录加载 |
| 目标 | tool-goal | 目标管理（创建/更新/完成） |
| 计划 | plan-mode (group: planMode, isolate) | 先规划后执行，禁止编辑操作 |
| 压缩 | compaction-basic, command-compact, tool-result-pruner (group: compaction, isolate) | 上下文自动压缩 + 工具结果裁剪 |
| 子代理 | tool-subagent, tool-subagent-fork, tool-subagent-control, tool-subagent-list-agents (group: workflowEngine, isolate) | spawn/fork/codex/claude-code 多种 provider |
| 工作流 | tool-workflow, tool-ralph, workflow-worker-thread (group: workflowEngine, isolate) | 工作流编排 + Ralph 循环（maxRounds: 64） |
| 交互 | tool-ask-user, tool-todo, tool-web | 向用户提问 + 待办 + Web 搜索 |

## 场景详解

### 场景 1：日常编码（最常用）

```
用户: "帮我修改 src/main.ts 里的 fetch 函数"
  → tool-fs-search: 定位文件
  → tool-fs: 读取内容
  → tool-fs: 写入修改

用户: "运行测试"
  → tool-bash: pnpm test

用户: "搜索 React 的 useContext 用法"
  → tool-web: 搜索并返回结果
```

### 场景 2：计划模式（复杂任务）

```
用户: "重构 authentication 模块"
  → 进入 plan-mode（isolate: planMode）
  → tool-fs-search: 扫描现有代码结构
  → tool-fs: 读取关键文件
  → exit_plan_mode: 提交计划文档
  → 用户审批 → 开始执行
```

**plan-mode 行为**：
- 禁止编辑、写文件、运行格式化器
- 只允许非变更读取和搜索
- 计划完成后通过 exit_plan_mode 提交
- 审批后才能开始实施

### 场景 3：子代理委派

```
用户: "同时修复 3 个 bug"
  → tool-subagent (spawn): 创建子代理 #1
  → tool-subagent (spawn): 创建子代理 #2
  → tool-subagent (spawn): 创建子代理 #3
  → tool-subagent-control: 监控进度
  → tool-subagent-list-agents: 列出所有子代理
```

**子代理 provider**：
- `spawn` — 独立进程（默认）
- `fork` — 共享内存（高性能）
- `codex` — OpenAI Codex（disabled by default）
- `claude-code` — Anthropic Claude Code（disabled by default）

### 场景 4：工作流编排

```
用户: "按这个步骤部署"
  → tool-workflow: 定义工作流步骤
  → workflow-worker-thread: 在工作线程执行
  → tool-ralph: Ralph 循环（maxRounds: 64）
```

### 场景 5：后台任务

```
用户: "启动一个后台服务器"
  → tool-bash: npm start &（后台运行）
  → tool-jobs: 列出后台任务
  → tool-jobs: 停止指定任务
```

### 场景 6：上下文压缩

```
会话过长时自动触发：
  → compaction-basic: 压缩历史上下文
  → tool-result-pruner: 裁剪工具结果
     thresholdChars: 8192（超过此长度裁剪）
     headChars: 4096（保留头部）
     tailChars: 1024（保留尾部）
```

## 关键配置

| 配置 | 值 | 说明 |
| :-- | :-- | :-- |
| persona.text | `You are a coding agent powered by the {{model}} model.` | 动态模型名 |
| agent-instructions.maxBytes | 65536 | 指令注入上限 |
| plan-mode.section | 280 行计划模式规则 | 完整的行为约束 |
| tool-result-pruner | threshold: 8192, head: 4096, tail: 1024 | 结果裁剪参数 |
| tool-ralph.maxRounds | 64 | Ralph 循环最大轮次 |
| tool-web.searchTimeoutMs | 60000 | Web 搜索超时 |
| tool-web.fetch | false | 禁止直接抓取网页 |
| tool-todo.allowParallelInProgress | true | 允许并行进行中的 todo |

## 与其他 preset 的关系

```
standard = 基础（~23 工具）
  ├─ + tool-cordis + skill → cordis（+2 工具 + 2 skill）
  ├─ + tool-presentation   → code（+1 工具，TypeScript 批量编排）
  └─ - 所有高级工具        → minimal（仅 3 工具）
```

# minimal — 极简模式

> 仅提供持久 bash 与 str_replace_editor 的双工具编码 Agent。

## 工具集 (3)

| 工具 | 说明 |
| :-- | :-- |
| persistent-bash / persistent-pwsh | 持久终端（平台自动切换），保持状态 |
| str-replace-editor | 字符串替换编辑器（基于字符串匹配，非行号） |

## 场景详解

### 场景 1：快速命令执行

```
用户: "运行 ls -la"
  → persistent-bash: ls -la
  → 返回目录列表

用户: "查看当前目录的文件大小"
  → persistent-bash: du -sh * | sort -rh
  → 返回文件大小排序
```

**特点**：终端状态持久，前一次命令的环境变量、工作目录会影响后续命令。

### 场景 2：简单文件编辑

```
用户: "修改文件第 10 行的内容"
  → str-replace-editor: 替换指定字符串
  → 返回修改后的文件内容
```

**编辑器行为**：
- 基于字符串匹配，不是行号
- 旧字符串必须唯一匹配
- 替换后显示上下文

### 场景 3：调试和验证

```
用户: "测试这个 shell 脚本"
  → persistent-bash: bash test.sh
  → 返回输出和退出码

用户: "检查环境变量"
  → persistent-bash: echo $PATH
  → 返回当前 PATH
```

### 场景 4：极简环境验证

```
用户: "验证 Node.js 是否安装"
  → persistent-bash: node --version
  → 返回版本号

用户: "检查 Python 虚拟环境"
  → persistent-bash: source venv/bin/activate && python --version
  → 返回 Python 版本
```

## 与 standard 的区别

| 维度 | standard | minimal |
| :-- | :-- | :-- |
| 工具数 | ~23 | 3 |
| 文件搜索 | tool-fs-search | 无 |
| Web 搜索 | tool-web | 无 |
| 技能系统 | skill + tool-skill | 无 |
| 目标管理 | tool-goal | 无 |
| 计划模式 | plan-mode | 无 |
| 上下文压缩 | compaction | 无 |
| 子代理 | subagent + workflow | 无 |
| 文件系统 | fs-sandbox (沙箱) | fs-local (裸访问) |
| 提示词 | 动态 ({{model}} {{cwd}}) | 固定 (complete: true) |

## 关键配置

```yaml
- id: persona
  name: '@deepseek-ai/dsh-persona'
  config:
    text: You are a helpful software engineer assistant.
    complete: true                    # 禁止其他文本注入系统提示词
    includeRuntimeContext: false      # 不注入运行时上下文

- id: persistent-shell              # group + isolate
  name: cordis:group
  group: true
  isolate:
    terminals: true                  # 私有终端实例
  config:
    - id: pty                         # PTY 注册表
    - id: terminal-bash               # Bash 终端后端
    - id: persistent-bash             # Bash 工具
    - id: terminal-pwsh               # PowerShell 终端后端
    - id: persistent-pwsh             # PowerShell 工具

- id: filesystem                    # group + isolate
  name: cordis:group
  group: true
  isolate:
    fs: true                         # 遮蔽宿主的 fs-sandbox
  config:
    - id: fs-local                    # 裸文件系统访问
    - id: str-replace-editor          # 字符串替换编辑器
```

## 特殊行为

- `persona.complete: true` — 禁止其他文本注入系统提示词
- `persona.includeRuntimeContext: false` — 不注入运行时上下文
- 使用 `fs-local` 遮蔽 `fs-sandbox` — 无文件系统限制
- `persistent-shell` group — 终端状态跨命令持久

## 适用场景

- 快速测试模型能力
- 极简环境验证
- 不需要复杂工具的简单任务
- 调试 shell 脚本

## 不适用场景

- 需要文件搜索的场景（无 tool-fs-search）
- 需要 Web 搜索的场景（无 tool-web）
- 需要计划模式的场景（无 plan-mode）
- 需要子代理的场景（无 subagent）

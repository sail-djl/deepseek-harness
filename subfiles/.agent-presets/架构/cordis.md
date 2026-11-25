# cordis — 创造模式

> 用于创建自定义 Agent preset：具备标准模式的全部能力，并提供运行时检查、插件实验和 preset 创作指导。

## 与 standard 的区别

```yaml
# standard 没有这两行
- id: tool-cordis
  name: '@deepseek-ai/dsh-tool-cordis'

- id: skill-filesystem
  name: '@deepseek-ai/dsh-skill-filesystem'
  config:
    customSkillDirs:
      - !!js "process.getBuiltinModule('node:url').fileURLToPath(new URL('skills/', baseUrl))"
```

## 场景详解

### 场景 1：创建新的 Agent Preset（核心场景）

```
用户: "帮我创建一个 Python 开发 preset"
  │
  ├─ Agent 读取 editing-cordis-compositions skill
  │    → 学习 preset 编写规范
  │
  ├─ Agent 使用 tool-cordis 读取运行时
  │    → 列出已加载的插件
  │    → 查看当前 preset 的配置
  │
  ├─ Agent 生成 agent.cordis.yml
  │    ├─ 复制 standard 的基础行
  │    ├─ 添加 Python 相关工具
  │    └─ 配置 persona 提示词
  │
  └─ Agent 使用 tool-cordis 挂载/测试新 preset
       → 验证插件是否正确加载
       → 调试配置问题
```

### 场景 2：调试现有 preset

```
用户: "为什么 standard 的 tool-web 没有工作？"
  │
  ├─ Agent 使用 tool-cordis 读取运行时
  │    → 检查 web 服务的注册状态
  │    → 查看 web-search-deepseek 的配置
  │
  ├─ Agent 诊断问题
  │    → 发现 fetch: false 配置
  │    → 或发现 web 服务未注册
  │
  └─ Agent 使用 tool-cordis 修复配置
       → override web 工具配置
       → 验证修复结果
```

### 场景 3：插件实验

```
用户: "测试一下这个新插件能不能加载"
  │
  ├─ Agent 使用 tool-cordis 挂载临时插件
  │    → cordis_mount(plugin_config)
  │
  ├─ Agent 测试插件功能
  │    → 调用插件提供的工具
  │    → 检查输出是否正确
  │
  └─ Agent 使用 tool-cordis 卸载插件
       → cordis_unmount(plugin_id)
```

### 场景 4：运行时状态检查

```
用户: "看看当前运行时的完整状态"
  │
  ├─ Agent 使用 tool-cordis 读取运行时
  │    → 列出所有已注册的服务
  │    → 查看每个服务的配置
  │    → 检查 realm 隔离状态
  │
  └─ Agent 输出运行时报告
       → 哪些插件在哪个 realm
       → 哪些服务是共享的
       → 哪些服务是隔离的
```

## 额外能力

| 能力 | 说明 |
| :-- | :-- |
| tool-cordis | 读取运行时、挂载/卸载插件、修改配置 |
| editing-cordis-compositions skill | 教 Agent 如何编辑 preset |
| cordis-plugin-development skill | 教 Agent 如何开发插件 |

## tool-cordis 操作

| 操作 | 说明 |
| :-- | :-- |
| `cordis_read()` | 读取运行时状态，列出所有服务 |
| `cordis_mount(config)` | 挂载一个临时插件 |
| `cordis_unmount(id)` | 卸载一个插件 |
| `cordis_override(id, config)` | 覆盖已有插件的配置 |
| `cordis_inject(id, service)` | 注入一个服务实例 |

## 信任警告

> tool-cordis 执行模型编写的 JavaScript，等同于 shell 权限。
> 不要在生产环境中使用此模式处理敏感数据。

## 内置 Skills

```
cordis/skills/
├── cordis-plugin-development/   ← 插件开发指南
│   └── SKILL.md
└── editing-cordis-compositions/  ← Preset 编辑指南
    └── SKILL.md
```

### editing-cordis-compositions skill 内容

- 两层架构说明：HOST composition vs AGENT PRESET
- 什么行该放 host（注册表、沙箱、审批）
- 什么行该放 preset（工具、提示词、注入）
- isolate realm 的正确用法
- preset 目录结构和命名规范
- 禁止编辑 shipped preset 的警告

### cordis-plugin-development skill 内容

- Cordis 插件 API
- 如何注册服务
- 如何声明依赖
- 如何使用 realm 隔离
- 插件生命周期

## 关键配置

| 配置 | 值 | 说明 |
| :-- | :-- | :-- |
| persona.text | 包含 HOST/AGENT PRESET 说明 | 教 Agent 理解两层架构 |
| skill-filesystem.customSkillDirs | `skills/` 目录 | 内置 skill 发现路径 |
| 其余 | 与 standard 完全相同 | ~25 工具 |

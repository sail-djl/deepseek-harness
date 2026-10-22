# my-agent — 用户自定义模板

> 用户基于 standard 复制并修改的自定义 preset。

## 当前状态

目录为空，需要首次使用时复制 standard 并编辑。

## 场景详解

### 场景 1：创建自定义 preset

```
# 1. 复制 standard 到用户目录
cp -r apps/cli/config/agent-presets/standard \
      ~/.dsh/.agent-presets/my-agent/

# 2. 编辑 agent.cordis.yml 添加自定义工具/技能
# 3. 编辑 preset.yml 修改名称和描述
```

### 场景 2：添加自定义 skill

```
用户: "给我的 preset 添加 Python 测试技能"
  │
  ├─ 创建 my-agent/skills/python-testing/SKILL.md
  │    → 定义 pytest 最佳实践
  │
  ├─ 编辑 agent.cordis.yml
  │    - id: skill-filesystem
  │      config:
  │        customSkillDirs:
  │          - !!js "process.getBuiltinModule('node:url').fileURLToPath(new URL('skills/', baseUrl))"
  │
  └─ 重启 DSH 生效
```

### 场景 3：添加自定义 MCP 服务

```
用户: "给我的 preset 添加 Redis MCP"
  │
  ├─ 创建 my-agent/cordis.patch.yml
  │    - id: mcp-redis
  │      name: '@deepseek-ai/dsh-mcp-client'
  │      config:
  │        serverName: redis
  │        transport: stdio
  │        command: npx
  │        args: ['-y', '@modelcontextprotocol/server-redis']
  │
  └─ 重启 DSH 生效
```

## 注意事项

- 不要直接编辑 shipped preset（standard/cordis/code/minimal）
- 升级 DSH 时 shipped preset 会被覆盖
- 用户 preset 放在 `$DSH_HOME/.agent-presets/` 下

## 与 Profile 的关系

```
Profile (package.json)
  bundles: [dsh-base, dsh-web-app]
    ↓
agent-presets 插件 (Layer 2 注入)
    ↓
扫描 agent-presets 目录（shipped + 用户目录）
    ↓
用户选择 preset → 加载 agent.cordis.yml
    ↓
插件注册到 Agent
```

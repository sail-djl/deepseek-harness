# CLI 入口 (apps/cli)

## 包信息

| 属性 | 值                        |
| :--- | :------------------------ |
| 包名 | `@deepseek-ai/dsh`      |
| 版本 | 0.1.1-rc.2                |
| 入口 | `lib/bin.js` (构建后)   |
| bin  | `dsh` → `lib/bin.js` |

## 文件结构

```
apps/cli/
├── src/
│   ├── bin.ts              ← CLI 入口 (#!/usr/bin/env node)
│   ├── args.ts             ← 命令行参数解析 (commander)
│   ├── profile-boot.ts     ← Profile 启动核心逻辑
│   ├── plugin.ts           ← 插件管理 (add/remove/list)
│   ├── dump-config.ts      ← --dump-config 实现
│   └── process-shutdown.ts ← 进程关闭处理
├── config/
│   └── agent-presets/      ← 内置 preset 定义
│       ├── standard/
│       ├── cordis/
│       ├── code/
│       ├── minimal/
│       └── my-agent/
├── tests/
│   ├── args.spec.ts
│   ├── built-bin.e2e.ts
│   └── ...
├── package.json
├── tsconfig.json
└── tsdown.config.ts        ← 打包配置
```

## 命令行参数

```bash
dsh [mode] [options]

Modes:
  web               启动 Web UI (默认 profile: web)
  plugin            插件管理
  --dump-config     导出配置树

Options:
  --profile <name>  指定 profile (默认: web)
  --patch <file>    外部 patch 文件 (可多次)
  --mode <mode>     Agent 模式 (standard/cordis/code/minimal)
  --no-open         不自动打开浏览器
  --port <port>     Web 服务端口
```

## 关键依赖

| 包                              | 用途           |
| :------------------------------ | :------------- |
| `commander`                   | 命令行参数解析 |
| `@deepseek-ai/dsh-app-boot`   | 环境变量加载   |
| `@deepseek-ai/dsh-web-app`    | Web 服务启动   |
| `@deepseek-ai/dsh-headless`   | 无头模式运行   |
| `@deepseek-ai/dsh-mcp-client` | MCP 客户端     |

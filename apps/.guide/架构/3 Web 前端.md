# Web 前端 (apps/web)

## 包信息

| 属性 | 值 |
| :-- | :-- |
| 包名 | `@deepseek-ai/dsh-web-frontend` |
| 版本 | 0.1.1-rc.2 |
| 入口 | `src/main.ts` |
| 构建 | `vite build` → `dist/` |

## 文件结构

```
apps/web/
├── src/
│   ├── main.ts              ← 入口 (挂载 React)
│   └── node-module-stub.ts  ← 模块存根
├── dist/                    ← 构建产物
│   ├── index.html
│   ├── assets/
│   │   ├── index-*.js       ← 主 bundle
│   │   ├── vendor-*.js      ← 第三方库
│   │   ├── index-*.css      ← 样式
│   │   ├── fonts/           ← KaTeX 字体
│   │   └── langs/           ← 代码高亮语言
│   └── favicon.svg
├── tests/
│   ├── *.e2e.ts             ← E2E 测试 (Playwright)
│   ├── snapshots/           ← 快照基线
│   └── support.ts           ← 测试工具
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 前端技术栈

| 层 | 技术 |
| :-- | :-- |
| 框架 | React 18 |
| 语言 | TypeScript 6 |
| 构建 | Vite 6 |
| 测试 | Vitest 4 + Playwright |
| 样式 | CSS (无 Tailwind) |

## 核心模块

| 模块 | 包名 | 职责 |
| :-- | :-- | :-- |
| Shell | `dsh-client-web` | 应用外壳、启动流程 |
| Connection | `dsh-client-connection` | WebSocket 连接管理 |
| Runtime | `dsh-client-runtime` | Session/Workspace 状态管理 |
| UI Renderer | `dsh-client-ui-renderer` | React 组件渲染 |
| Slots | `dsh-client-ui-slots` | 插槽系统 (plugin UI 注入) |

## 启动流程 (Boot)

### 完整启动链

```
浏览器打开 http://127.0.0.1:5300
  │
  ├─ 1. 加载 dist/ (静态 JS/CSS)
  │     └─ main.ts → new AppWebEntry(el).run()
  │
  ├─ 2. 显示 Boot Page (纯 DOM，无 React)
  │     └─ "HARNESS" + 旋转进度条 + "Loading plugins…"
  │
  ├─ 3. 创建模块系统 + Cordis Context
  │     └─ window.__ModuleLoader__ → manifest.plugins 列表
  │
  ├─ 4. 预取 Immediate Tier 插件 (并行)
  │     └─ manifest 中 immediately: true 的插件
  │
  ├─ 5. 逐个加载所有插件 ⭐
  │     for (name of manifest.plugins) {
  │       loader.create({ name })  ← import + apply 插件
  │       更新 Boot Page 进度条
  │     }
  │     loader.await()  ← 等待所有插件 quiescence
  │     assertEntriesActive()  ← 审计：每个插件是否 active
  │
  ├─ 6. 挂载 React 应用
  │     ctx.inject(['uiRenderer'], scope => {
  │       scope.uiRenderer.mount(container)  ← 替换 Boot Page
  │     })
  │
  └─ 7. 用户看到完整 Web UI
```

### Boot Page (纯 DOM)

- 框架无关，不依赖 React，在 JS 加载后立即显示
- 显示 "HARNESS" wordmark + 旋转进度条 + "Loading plugins…"
- 进度条弧度随插件激活比例增长：`--dsh-boot-arc` 从 72° → 288°
- 插件失败时显示 "Failed to load plugins" + 失败列表

### 插件加载机制

| 阶段 | 说明 |
| :-- | :-- |
| prefetch | 预取 `immediately: true` 的插件 bundle (并行 HTTP) |
| create | 逐个 `loader.create({ name })` — import + apply |
| await | `loader.await()` — 等待所有插件 fiber 达到终态 |
| audit | `assertEntriesActive()` — 检查每个插件是否 active |

### 关键源码

| 文件 | 职责 |
| :-- | :-- |
| `apps/web/src/main.ts` | 入口：挂载 `AppWebEntry` 到 `#root` |
| `packages/client/web/src/boot.ts` | Boot 内核：模块系统 + Cordis Loader + 插件加载 |
| `packages/client/web/src/boot-page.ts` | Boot Page：纯 DOM 加载页 |
| `packages/client/web/src/seed.ts` | 静态模块表 |

## 构建与部署

```bash
# 开发模式 (HMR)
pnpm dev

# 构建
pnpm build

# 测试
pnpm test
```

构建产物 `dist/` 被 `apps/cli` 的 `dsh web` 命令静态托管。

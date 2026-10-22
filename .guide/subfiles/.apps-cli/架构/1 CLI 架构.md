# CLI 架构

## 入口分发

```
dsh 命令
  │
  ├─ parseDshArgs(argv, version)     ← args.ts 解析参数
  │    └─ 返回 DshInvocation (mode + profile + patches + args)
  │
  └─ switch (invocation.mode)        ← bin.ts 动态分发
       ├─ 'profile'     → runProfile()      // 启动 profile
       ├─ 'plugin'      → runPlugin()       // 插件管理
       └─ 'dump-config' → runDumpConfig()   // 导出配置
```

关键：**动态 import**，每个 mode 只加载自身路径，其他 mode 代码不入内存。

## 参数解析设计 (args.ts)

commander 配置的核心是**launcher flags 优先 + 内层透传**：

```
dsh --profile web --no-open --port 5300
     ^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^
        launcher 解析      透传给 web app
```

- `--profile` / `--patch` / `--dump-config` 属于 dsh 自己
- 第一个未知 token（如 `--no-open`）开始，全部 `passThroughOptions` 给 booted app
- `web` 是 `--profile web` 的硬编码别名
- `plugin` 子命令拒绝 parent flags

## Profile 启动流程 (profile-boot.ts)

```
runProfile(options)
  │
  ├─ 1. composeProfile(profile, patchFiles)
  │      ├─ prepareProfile()     加载 profile + 重写空根配置
  │      ├─ loadOptionalPatches()  读 $DSH_HOME/cordis.patch.yml
  │      ├─ loadOverlayPatches()   读 --patch 文件
  │      ├─ bundlePatches       收集 bundle 层
  │      ├─ 注入 agent-presets 根     (SHIPPED preset root)
  │      └─ 解析遥测开关
  │
  ├─ 2. installFailLoud()        安装失败即崩溃
  ├─ 3. process.on(SIGTERM/SIGINT)
  ├─ 4. boot(rootConfig, allPatches)
  │      └─ provide(launch env) + provide(cmdline args)
  ├─ 5. HMR 监听
  │      └─ watchUserPatches(profile + home cordis.patch.yml)
  └─ 6. 返回 ctx + shutdown
```

### 空根配置机制

`PROFILE_ROOT_CONFIG = []`。每次启动重写 `cordis.yml`，防止 vendored Loader 的 tree 写回把已组合的 bundle 行 bake 进文件导致下次 boot 重复。

### Patch 对象克隆

`composeLive` / `boot` 都用 `structuredClone` 克隆 patch。因为 include 把 `insert` 行按**引用** push 进插件树，后续 id-targeted patch 会就地修改这些对象 — 不克隆会污染 bundle 内存态。

## 插件管理流程 (plugin.ts)

```
dsh plugin --profile <name> <pnpm args>
  │
  ├─ 1. resolveProfileDir()
  ├─ 2. 首次使用 → initProfile() (写模板 bundles)
  ├─ 3. spawnSync('pnpm', args, cwd: profileDir)
  │      └─ 相对路径规格锚定到调用 cwd
  ├─ 4. reconcilePlugins()
  │      ├─ 依赖声明 dsh.bundle → 加入 bundles
  │      └─ bundle-less 依赖 → 移出 + 警告
  └─ 5. 返回 pnpm exit code
```

## 配置导出流程 (dump-config.ts)

```
dsh --profile <name> --dump-config
  │
  ├─ prepareProfile(profile, !defaultOnly)
  │      userLayer=false → 不解析 cordis.patch.yml (修复损坏配置)
  ├─ layers[] = bundle layers
  ├─ (非 defaultOnly) + profile patch + home patch + --patch overlays
  └─ renderConfigDump() → 打印注释名各 source file 的配置树
```

不 boot、不执行 `!!js`，只走 include 的 patch 算法。

## 数据流

```
命令行参数
  → args.ts 解析 (commander)
  → bin.ts 分发 (动态 import)
  → profile-boot.ts (profile 启动)
      → dsh-app-boot (boot/compose/loadProfile)
          → cordis-plugin-loader (插件树)
          → bundle patches → profile patches → home patches → overlays
      → cordis-plugin-hmr (热重载)
  → 返回 ctx 给 booted app
```

## 源码索引

| 文件 | 职责 |
| :-- | :-- |
| `src/bin.ts` | CLI 入口，mode 分发 |
| `src/args.ts` | commander 参数解析 |
| `src/profile-boot.ts` | Profile 启动，patch 层叠，HMR |
| `src/plugin.ts` | 插件管理 (pnpm 转发) |
| `src/dump-config.ts` | 配置导出 |
| `src/process-shutdown.ts` | 关闭处理 |

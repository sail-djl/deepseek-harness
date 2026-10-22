# .guide_work — work 专属内容登记处

> `dsharnesswork`（deepseek-harness 的 `master_work` 分支工作副本）中，**凡本仓库 / 本分支专属的 guide 内容，统一登记在本目录**，不散落到共享目录。
> 定位与 `dsharnesscode\.guide_code` 同构（code 版 README 见 `E:\baizhoucode\companyagent\dsharnesscode\.guide_code\README.md`）。

## 为什么单独一个目录

| 目录 | 职责 | 来源 | 可否被同步覆盖 |
|:--|:--|:--|:--|
| `.guide/`（2026-10-22 已引入） | 共享 guide 内容（只读镜像） | 从 guide 仓 `master-guide` 分支 git 同步 | **会**——每次同步整目录镜像覆盖 |
| `.guide_work/` | work 分支 / 本仓库专属内容 | 本仓库自行维护 | **不会**——同步流程不触碰本目录 |

本仓自 2026-10-22 起同时持有 `.guide/` 共享镜像（从 guide 分支 git 同步引入）与本目录；work 专属的版本追踪、定制记录、实战笔记仍一律放本目录，与共享副本物理隔离——同步只覆盖 `.guide/`，不触碰本目录。

## 本目录内容

| 位置 | 内容 | 状态 |
|:--|:--|:--|
| `README.md` | 本说明 + work 版打造实录（下方章节） | 已登记（2026-10-16）；双 guide 目录机制登记（2026-10-22） |

后续新增的 work 独有场景文档（预设、MCP、skill、部署笔记等）按类别建文件夹登记，命名对齐 `.guide_code`。

---

## work 版打造实录（2026-10-16）

### 1. 目标与身份

| 项 | 值 |
|:--|:--|
| 仓库 / 分支 | `E:\baizhoucode\companyagent\dsharnesswork` 的 `master_work`（自上游 `master` 拉出，@ `86a402200d`） |
| 版本 | `0.2.1-alpha.4`（master 最新） |
| 产品名 `DSH_DESKTOP_PRODUCT_NAME` | `Baizhou DSH Work` |
| 品牌目录 `DSH_DESKTOP_BRAND_DIR` | `apps\desktop\resources\brands\work` |
| AppId `DSH_DESKTOP_APP_ID` | `com.baizhou.dsh-work`（`apps\desktop\.env.windows`，Git 忽略） |
| 产物名 | `baizhou-dsh-work-0.2.1-alpha.4-win-x64-unsigned.exe` |
| 预设 | 按用户决策**保留上游全部 4 个**（standard / minimal / cordis / ptc） |

### 2. 品牌机制移植

- 从 `dsharnesscode`（`code` 分支）移植品牌改动 **18 个文件**：16 个修改（`git apply --3way` 解 alpha.4 版本冲突，已暂存）+ 4 个新增未跟踪（`render-brand-installer-assets.ts`、`render-brand-tray-icon.ts`、`src\app-manifest.ts`、`resources\brands\work\`）
- 品牌机制链路：env（`DSH_DESKTOP_PRODUCT_NAME`/`BRAND_DIR`）→ 小写产物名 + `-work` 产物目录后缀 + `resources\brands\work\` 资源 + `app-manifest.ts` 注入窗口标题/语言包
- 渲染脚本按 work 改：品牌目录 `brands/work`、`BRAND_WORDMARK = 'Baizhou DSH Work'`，重跑产出横幅 5 图 + `tray.ico`（16–64px）

### 3. 薄荷绿全套改色（用户选定：柔和薄荷绿）

| 落点 | 色值 / 改法 |
|:--|:--|
| `icon.png` 应用图标底色 | 白 → **`#A8E6CF`**（sharp raw 像素替换：不透明白 r,g,b≥240 整体换色，圆角外透明不动，深色鲸鱼保留） |
| `icon-windows.svg` 鲸鱼强调色 | `#4D6BFE` → **`#2DBE8B`** |
| render 脚本常量 | `BRAND_BLUE` → `BRAND_ACCENT = '#2DBE8B'`（脚本强制校验 SVG 必须用该色，不同步会 throw） |
| 重跑渲染 | `pnpm run render:brand-installer-assets`、`pnpm run render:brand-tray-icon` |

验证：`win-unpacked\resources\icon.png` 背景像素 = `168,230,207`；`tray.ico` 32px 全部不透明像素为绿色系；横幅目检通过。

> 配色关系：code 版 = 薰衣草紫底 + 品牌蓝鲸鱼；work 版 = 薄荷绿底 + 薄荷绿鲸鱼。

### 4. 网络故障与修复（打包连挂 3 次的根因）

| run | 失败点 | 根因 |
|:--|:--|:--|
| 1 | `prepare:primary-runtime` 314s `TimeoutError` | python 下载 fetch 默认 300s 超时（`DSH_RESOURCE_DOWNLOAD_TIMEOUT_MS`） |
| 2 | `ConnectTimeoutError github.com:443 (10000ms)` | undici 直连 github 不稳；**Node fetch 不读代理 env** |
| 3 | `download:electron` 同错（zip 已缓存仍联网） | `@electron/get` 校验时 **bypass 重新拉 `SHASUMS256.txt`**——缓存命中也必须联网 |

**修复（此后每次打包必带）**：

```powershell
$env:ELECTRON_GET_USE_PROXY = 'true'
$env:HTTPS_PROXY = 'http://127.0.0.1:7897'
$env:HTTP_PROXY  = 'http://127.0.0.1:7897'
$env:DSH_RESOURCE_DOWNLOAD_TIMEOUT_MS = '1800000'
```

辅助：从 `dsharnesscode\apps\desktop\.desktop-build\downloads` 拷贝 14 个哈希寻址热缓存文件（python/wheels/npm tarball，校验一致）。

### 5. 打包结果（成功）

| 项 | 值 |
|:--|:--|
| 预检 | `pnpm --dir apps/desktop run check:package -- --unsigned` 通过（普通版默认签名态报错属预期，两仓一致） |
| 完成凭证 | `apps\desktop\.desktop-build\packaging-runs\2026-10-16T13-40-39.774Z-xfaTEv\result.json` → `"success": true`，`completedAt=2026-10-16T14:11:28Z` |
| 产物 | `.desktop-build\targets\win-x64\unsigned-artifacts-work\baizhou-dsh-work-0.2.1-alpha.4-win-x64-unsigned.exe`（274.3 MB）+ blockmap |
| 免安装目录版 | 同目录 `win-unpacked\Baizhou DSH Work.exe` |
| 冒烟 | 运行时能力 / CLI 离线插件装卸 / dsh web / DOCX-XLSX-PPTX→PDF 全过 |
| 耗时 | 约 31 分钟（热缓存 + 代理可用时约 20 分钟） |

## 共享内容同步流程（双 guide 目录机制，2026-10-22）

`.guide/` 与 `.guide_work/` 双目录并行：共享根只读镜像，专属根自维护。

```powershell
$guide='E:\baizhoucode\companyagent\dsharnessguide'
git -C E:\baizhoucode\companyagent\dsharnesswork fetch $guide master-guide
git rm -r .guide                                  # 整目录镜像覆盖（首次无 .guide 时跳过）
git checkout FETCH_HEAD -- .guide                 # 与 guide 分支逐字节一致
git diff FETCH_HEAD -- .guide                     # 应为空 = 镜像一致
git commit -m 'perf guide 同步：从 guide 分支引入 .guide 共享镜像；'
```

> 同步只覆盖 `.guide/`，永不触碰 `.guide_work/`；两个目录均已纳入 `master_work` 版本跟踪。

## 维护约定

- **work 专属 → 写 `.guide_work/`**；共享内容 → 写 guide 仓（`dsharnessguide` 的 `master-guide` 分支），再 git 同步过来。
- 品牌资产（图标/横幅/托盘）改动后必须重跑两个 render 脚本并**重新打包**（图标已烤进 exe 与安装器）。
- 打包命令始终带代理 env（§4），完成凭证只认 `result.json` 的 `success:true + completedAt`。
- 经验已沉淀至 skill：`win-dsh-package-sec`（场景「桌面端部署」work 变体/图标改色 + `knowledge/下载缓存与网络修复.md`）。
- `.guide_work/` 自 2026-10-22 起**纳入 `master_work` 版本跟踪**；`.env.windows` 仍为本地文件（Git 忽略）。

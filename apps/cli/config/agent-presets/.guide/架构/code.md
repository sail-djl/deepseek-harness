# code — PTC 模式

> 具备标准模式的全部能力，并通过 Code Mode SDK 呈现工具，让模型用一个 TypeScript 程序组合多步操作。

## 与 standard 的唯一区别

```yaml
# standard 没有这一行
- id: tool-presentation
  name: '@deepseek-ai/dsh-agent-tool-presentation'
  config:
    mode: code
```

**PTC = Programmatic Tool Composition**，核心思想是把多次工具调用合并为一个 TypeScript 程序。

## 场景详解

### 场景 1：批量文件操作（最典型）

```
用户: "批量重命名 src/ 下所有 .js 为 .ts"
  │
  ├─ 模型生成 TypeScript 程序
  │    ├─ 1. 读取目录列表（tool-fs-search）
  │    ├─ 2. 过滤 .js 文件
  │    ├─ 3. 逐个重命名（tool-fs × N 次）
  │    └─ 4. 报告结果
  │
  └─ run_code 一次性执行
       → 原本 5+ 次工具调用 → 1 次 run_code
```

### 场景 2：数据转换管道

```
用户: "把 data.csv 转为 JSON 并过滤无效行"
  │
  ├─ 模型生成 TypeScript 程序
  │    ├─ 1. 读取 CSV（tool-fs）
  │    ├─ 2. 解析 + 过滤
  │    ├─ 3. 写入 JSON（tool-fs）
  │    └─ 4. 统计转换结果
  │
  └─ run_code 一次性执行
```

### 场景 3：代码迁移

```
用户: "把项目里所有 import { X } from 'vue' 改为 import { X } from 'vue3'"
  │
  ├─ 模型生成 TypeScript 程序
  │    ├─ 1. 搜索所有包含旧 import 的文件（tool-fs-search）
  │    ├─ 2. 批量替换内容（tool-fs × N）
  │    └─ 3. 验证修改结果
  │
  └─ run_code 一次性执行
```

### 场景 4：项目分析

```
用户: "分析这个项目的依赖关系图"
  │
  ├─ 模型生成 TypeScript 程序
  │    ├─ 1. 读取 package.json（tool-fs）
  │    ├─ 2. 扫描所有源文件的 import（tool-fs-search）
  │    ├─ 3. 构建依赖图
  │    └─ 4. 输出分析报告
  │
  └─ run_code 一次性执行
```

## 工作原理

```
tool-presentation (mode: code)
  │
  ├─ 等待 codeRuntime 服务就绪
  │    （如果部署未配置 TypeScript runtime，preset mount 失败）
  │
  ├─ 模型收到 SDK 描述
  │    → 知道有哪些工具可用（tool-fs, tool-bash 等）
  │    → 生成 TypeScript 程序调用这些工具
  │
  └─ run_code 执行
       → 程序在安全沙箱中运行
       → 工具调用转发给实际服务
       → 结果返回给模型
```

## 关键配置

| 配置 | 值 | 说明 |
| :-- | :-- | :-- |
| tool-presentation.mode | `code` | 启用 Code Mode SDK |
| codeRuntime | host composition 提供 | 需要 TypeScript 运行时 |
| 其余 | 与 standard 完全相同 | ~24 工具 |

## 适用 vs 不适用

| 适用 | 不适用 |
| :-- | :-- |
| 批量文件操作（5+ 次调用） | 单次简单操作（1-2 次调用） |
| 多步骤自动化 | 需要用户交互的场景 |
| 数据处理管道 | 需要实时观察的场景 |
| 代码迁移/重构 | 需要逐行审查的场景 |

## 与 standard 的对比

```
standard:  用户指令 → 工具调用 → 结果 → 工具调用 → 结果 → ...
           （每次工具调用都是一次独立的模型推理循环）

code:      用户指令 → 模型生成 TypeScript 程序 → run_code 执行
           （多个工具调用合并为一次执行）
```

**优势**：减少模型推理次数，降低延迟和 token 消耗
**劣势**：模型需要一次性生成完整的程序逻辑，调试困难

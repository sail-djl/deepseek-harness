# MCP 预设（业务 MCP Server 清单）

> code 分支专属 MCP 配置。登记处：`.guide_code/mcp/`。
> MCP Server 内嵌在 agent 预设文件里（`packages/bundle/web-app/presets/bzcode-haiyu.patch.yml` / `bzcode-shuili.patch.yml`），无独立 MCP 配置文件。
> 驱动插件：`@deepseek-ai/dsh-mcp-client`（`packages/mcp/mcp-client`），`transport: stdio`。

## ⚠️ 安全提示

源预设文件的 MCP Server 行含**明文数据库账密 / SSH 密码**（如 `SSH_MCP_PASSWORD`）。本文**只登记 id 与类别，不复制任何账密**。账密以源 preset 文件为准，且勿外传、勿复制进共享文档。

## 海渔（bzcode-haiyu，16 个）

| 类别 | Server id | command |
| :-- | :-- | :-: |
| MySQL | `mcp-mysql-haiyu-dev` | npx |
| MySQL | `mcp-mysql-hotel` | npx |
| MySQL | `mcp-mysql-xiuyu` | npx |
| MySQL | `mcp-mysql-mintou` | npx |
| MySQL | `mcp-mysql-sea-jk` | npx |
| PostgreSQL | `mcp-postgres-claw` | npx |
| Redis | `mcp-redis-haiyu` | npx |
| TDengine | `mcp-tdengine-haiyu` | python |
| SSH | `mcp-ssh-hy-xiapu` | npx |
| SSH | `mcp-ssh-hy-xiuyu` | npx |
| SSH | `mcp-ssh-hy-mintou` | npx |
| SSH | `mcp-ssh-hy-huian` | npx |
| SSH | `mcp-ssh-neiwang-98` | npx |
| SSH | `mcp-ssh-neiwang-30` | npx |
| SSH | `mcp-ssh-hy-jikong` | npx |
| SSH | `mcp-ssh-jikong-1` | npx |

> 注：preset 文件头注释写「13 个 MCP」，但实际 grep 到 16 个 `mcp-*` id（可能后续追加未更新注释）。以上以实际 id 为准。

## 水利（bzcode-shuili，6 个）

| 类别 | Server id | command |
| :-- | :-- | :-: |
| MySQL | `mcp-mysql-shuili-yeji` | npx |
| MySQL | `mcp-mysql-shuili-dev` | npx |
| MySQL | `mcp-mysql-shuili-prod` | npx |
| SSH | `mcp-ssh-qingliang` | npx |
| SSH | `mcp-ssh-awss-jk1` | npx |
| SSH | `mcp-ssh-awss-jk2` | npx |

## 与 agent 预设的关系

这些 MCP Server 不是独立配置，而是作为 `plugins` 行插在对应 agent 预设里，并由 persona 插件的 `suffix` 提示模型可用哪些业务 MCP：

- 海渔：persona suffix 提示 `(MySQL, PostgreSQL, Redis, TDengine, SSH)`
- 水利：persona suffix 提示 `(MySQL, SSH)`

因此增删业务 MCP 时，需同时改 preset 文件的 MCP 行与 persona `suffix` 提示。

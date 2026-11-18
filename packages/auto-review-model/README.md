# dsh-auto-review-model

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 实验性的 Auto review（`purpose: "auto-review"`）单独指定审查模型、推理强度和审查提示词，并在会话内提供实时审查日志面板。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | `@deepseek-ai/dsh-experimental-auto-review`、`@deepseek-ai/dsh-storage-domain` |
| 数据保存 | profile 的 `cordis.patch.yml`（设置） + Host `auto_review_log` storage domain（日志） |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/auto-review-model"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/auto-review-model"
```

## 用法与配置

### 1. 选择模型与提示词

打开 **Plugins → dsh-auto-review-model**：

- **模型与推理强度**：选择专用审查模型，或保持 **跟随会话**。若所选 provider 当前不可用，Host 会自动回退到当前会话模型并记警告。
- **审查提示词**：支持三种模式：
  - `default`（内置）：保留 Auto review 原生审查规则。
  - `append`（追加规则）：在内置规则末尾追加自定义规则，保留内置风险分级与 JSON 输出要求。
  - `replace`（替换）：整段替换内置规则；必须保留严格 JSON 输出格式（`allow`/`deny` + `risk`），否则审查会被判定失败并拦下工具调用。

### 2. 查看会话审查日志

- 输入框左侧显示当前生效的审查模型标签（点击跳转设置），以及本会话的审查计数标签（点击打开实时日志弹窗）。
- 弹窗通过 SSE 实时更新每次审查的工具名、风险级别、允许/拒绝结果、耗时与理由，并支持一键跳转到对应工具调用（含 `run_code` PTC 父调用）或 **Clear** 清空当前会话日志。

## 数据与边界

- **日志上限**：`auto_review_log` 采用 `per-record` 布局，每个会话最多保留最近 **200** 条记录，Host 最多保留 **300** 个会话（旧会话按更新时间淘汰）；工具参数截断至 4000 字符，理由截断至 2000 字符。
- **隐私**：日志只保存在本机 Host，参数中可能包含工具输入里的敏感信息，可随时在弹窗点 **Clear** 删除。
- 插件不会自行开启 Auto review，也不会影响主对话或其他非 `auto-review` 模型请求。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/auto-review-model)。

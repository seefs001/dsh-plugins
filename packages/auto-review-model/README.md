# dsh-auto-review-model

为实验性 Auto review（`purpose: "auto-review"`）单独指定审查模型、推理强度和审查提示词，并在会话内提供实时审查日志。依赖 `@deepseek-ai/dsh-experimental-auto-review` 和 `@deepseek-ai/dsh-storage-domain`。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/auto-review-model"
```

本地开发：

```bash
dsh plugin --profile web add "link:$PWD/packages/auto-review-model"
```

## 用法

### 模型与提示词

打开 **Plugins → dsh-auto-review-model**：

- **审查模型与推理强度**：选择专用模型，或保持 **跟随会话**。若所选 provider 不可用，自动回退到会话模型并记录警告。
- **审查提示词**：
  - `default`（内置）：保留 Auto review 原生策略。
  - `append`（追加规则）：接在内置策略末尾，保留原有风险分级与 JSON 输出要求。
  - `replace`（替换）：整段替换内置策略（需保持严格 JSON 输出，否则工具调用会被拦截）。

### 会话审查日志

处于 Auto 模式时，输入框左侧会显示审查标签与本会话计数。点击打开实时日志面板（SSE 推送），可展开参数与判定理由、一键跳到对话中对应的工具调用（支持 `run_code` PTC 父调用）、跳转设置页或清空当前会话日志。

## 存储

设置保存在 `cordis.patch.yml`；审查日志存在本机 Host 的 `auto_review_log` storage domain，每会话最多保留最近 200 条、全局最多保留 300 个会话。

完整说明见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/auto-review-model)。

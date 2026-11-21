# dsh-message-actions

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）每条已完成助手回复旁添加 **Wait, what?** 按钮：发起一次隔离的模型调用，在弹窗中流式解释该回复缺失的前提与逻辑连接，不改动主对话也不占用上下文。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/message-actions"
```

## 用法与配置

- **在对话中解释**：点击任意已完成文本回复底部的 **Wait, what?**，弹窗流式展示解释，并支持复制、查看原文与重新生成。
- **独立模型设置**：在弹窗右上角或 **Plugins → dsh-message-actions** 中指定专用模型与推理强度，留空则沿用原回复的模型。
- **Agent 工具**：同时注册 `message_actions` 工具（`get_settings`、`save_settings`、`inspect`、`generate`）。

解释请求仅发送该条回复及前一条用户消息，不附带工具或文件访问权限。配置保存在 profile 的 `cordis.patch.yml`，解释结果缓存于 Host 的 `message_actions` storage domain（最多 200 条）。

## 开发构建

修改前端源码 `src/client.js` 后重新打包 `lib/client.js`：

```bash
pnpm --filter dsh-message-actions build
```

详细文档见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/message-actions)。

# dsh-message-actions

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）每条已完成助手回复旁增加 **Wait, what?** 按钮：使用一次隔离的模型调用解释这条回复缺少的前提和逻辑连接，结果在弹窗中流式呈现，不修改主对话，也不占用后续上下文。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | `@deepseek-ai/dsh-storage-domain` 及至少一个可用模型 provider |
| 数据保存 | profile 的 `cordis.patch.yml`（专用模型配置） + Host `message_actions` storage domain（缓存最近 200 条解释） |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/message-actions"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/message-actions"
```

## 用法与配置

- **在对话中使用**：在任意已完成的文本回复底部操作栏点击 **Wait, what?**，弹窗通过 NDJSON 流式显示解释（支持查看所使用的提示词与模型，以及强制重新生成）。
- **指定解释模型**：打开 **Plugins → dsh-message-actions**，可指定独立模型与推理强度，或留空以跟随原回复所用模型。
- **Agent 工具**：插件同时注册 `message_actions` 工具（`get_settings`、`save_settings`、`inspect`、`generate`）。

## 数据与边界

- 插件使用固定的 ASD-STE100 简化技术英语（并按原回复语言输出）解释提示词，不支持自定义或编辑模板。
- 生成时会把所选回复及前一条用户消息发往对应模型服务（不带工具、不读取项目文件），并将结果明文缓存于 Host `message_actions` storage domain（上限 200 条）。

## 开发构建

本包前端源码位于 `src/client.js`，发布或修改前端代码后需重新打包 `lib/client.js`：

```bash
pnpm --filter dsh-message-actions build
```

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/message-actions)。

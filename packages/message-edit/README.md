# dsh-message-edit

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）中编辑自己发出的消息：悬停消息点击铅笔图标，即可在当前会话就地改写（默认清空后续消息与上下文并重新回答），或分叉到新会话并重发。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/message-edit"
```

## 编辑模式

| 模式 | 效果 |
| --- | --- |
| **在当前会话修改**（默认勾选 **清空后续消息并重新回答**） | 用 `replace` 节点替换该消息并清除后续模型上下文，在聊天界面隐藏已清除的后续消息，并自动触发新一轮回复 |
| **在当前会话修改**（取消勾选 **清空后续消息并重新回答**） | 仅替换该消息文本，保留后续界面消息、对话与工具结果上下文，不触发新回复 |
| **分叉并重发** | 从该消息前最近的已结束轮次创建新会话并发送修改后的消息，原会话不变 |

仅编辑消息纯文本，原有图片和文件附件保持原位；改写过的消息会显示「已编辑」标签。若消息已因上下文压缩移出当前上下文，可改用 **分叉并重发**。直接写入 DSH 原生会话事件日志，无额外存储。

详细文档见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/message-edit)。

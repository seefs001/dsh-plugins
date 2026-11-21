# dsh-message-edit

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）中编辑自己发出的消息：悬停消息点击铅笔图标，即可在当前会话就地改写（默认清空后续模型上下文），或分叉到新会话并重发。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/message-edit"
```

## 编辑模式

| 模式 | 效果 |
| --- | --- |
| **在当前会话修改**（默认勾选 **清空后续上下文**） | 用 `replace` 节点替换该消息并移除后续模型上下文；界面历史保留，不自动触发新回复 |
| **在当前会话修改**（取消勾选 **清空后续上下文**） | 仅替换该消息文本，保留后续对话与工具结果上下文 |
| **分叉并重发** | 从该消息前最近的已结束轮次创建新会话并发送修改后的消息，原会话不变 |

仅编辑消息纯文本，原有图片和文件附件保持原位；改写过的消息会显示「已编辑」标签。若消息已因上下文压缩移出当前上下文，可改用 **分叉并重发**。直接写入 DSH 原生会话事件日志，无额外存储。

详细文档见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/message-edit)。

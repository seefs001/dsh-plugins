# dsh-message-actions

在每条已完成回复的点赞点踩旁加入 **Wait, what?**。点一下，插件用一次独立的模型调用把这条回复重新讲清楚，结果显示在弹窗里。不需要再发 `/wait-what`，不向主对话追加消息，不改原回复，也不占用主对话之后的上下文。

插件只做这一件事，使用固定的 Wait, what? 提示词，不提供自定义模板或提示词编辑。

## 使用

1. 点击回复底部的 **Wait, what?**。
2. 有匹配缓存时立即显示；没有时自动开始生成。
3. 弹窗里可停止、复制或重新生成。点击弹窗外部、按 Esc 或点右上角 × 均可关闭；关闭后重新打开仍可读取缓存。
4. 需要换模型时，打开 **模型设置**，选择后点击 **保存并解释**。

解释正文支持 Markdown 和 GFM，包括标题、列表、引用、链接、代码块、表格和任务列表；生成过程中也会实时渲染。复制和缓存仍保留原始 Markdown。原始 HTML 不会执行，图片显示为链接，不自动加载外部资源。

固定提示词改编自作者本地的 `wait-what` skill：补上读者缺失的前提和联系，把回复重新讲清楚。它不会只删字，也不会重新回答原问题。默认沿用原回复语言；英文使用 ASD-STE100，其他语言使用相同的简明技术表达原则。

独立调用只读取所选回复和它之前最近一条用户消息的文本，不加载完整主对话、系统提示词、其他技能或工具。它没有项目文件访问能力，因此沿用原文中的项目术语，不会假装已读取 `GLOSSARY.md` 或 `GLOSSARY-MAP.md`。如果这两条消息不足以提供关键前提，解释也可能不完整。

## 指定模型

在插件页面的 **Wait, what? 专用模型** 中设置，也可以从解释弹窗的 **模型设置** 进入：

- **沿用每条原回复的模型**：默认选项，沿用那条回复的 provider、model 和对应请求的推理强度。
- **指定模型**：从 DSH 已配置的可用模型中选择，仅用于 Wait, what?，不改变主对话的选型。
- **推理强度**：所选模型支持时可选择；“模型默认”使用该模型当前默认值，不继承另一模型的强度。
- **保存模型**：插件页面保存后，下一次解释使用新设置。弹窗的 **保存并解释** 会按新设置读取缓存或生成解释。

设置通过 DSH config editor 保存到当前 profile，所有会话共用，刷新和重启后保留。只写本插件的 `provider`、`model`、`reasoningEffort`，不直接改写 profile 文件。空 provider/model 表示沿用原回复；保存失败会明确报错，不声称已保存。指定的 provider 不可用时提示修改设置，不静默改用原模型。模型列表刷新失败会显示原因。

保存期间禁止重复提交；弹窗保存期间暂时不能关闭或发起生成。保存成功才应用新模型，失败保留草稿。生成中可以停止或关闭弹窗，未完成内容不覆盖旧缓存。

## 缓存与隐私

- 结果保存在 Host 的 `message_actions` storage domain，刷新浏览器和重启 DSH 后仍可读取，多个浏览器共用。
- 缓存键包含会话、消息、原回复、上一条用户消息、解析后的模型参数和固定提示词。切换模型或推理强度后分别匹配缓存，切回来可复用仍保留的旧结果。
- 最多保留最近 200 份完整结果。相同键重新生成替换旧结果；超限后按生成时间淘汰，不设置自动过期。
- **重新生成** 明确绕过缓存。失败、中断、空输出或达到输出上限时，不把不完整文本存为缓存，已有结果保留。
- 不启动 Agent、不执行工具。浏览器一键操作不会产生主对话中的用户消息、工具记录或二次解释。
- 提示词和结果明文保存在 Host。生成时，选中的文本会发给指定模型服务，未指定时发给原回复的模型服务；不发送整个对话、附件或思考过程。浏览器操作仅对 Host owner 开放。
- 旧版本自定义模板不再读取或暴露，也不主动删除已有磁盘记录。旧缓存仅在完全匹配当前固定解释时复用。

## 安装与更新

需要 DSH `>=0.2.2-rc.2 <0.3.0`、Web 界面及一个已配置的模型 provider。

```bash
dsh plugin --profile web add link:$PWD/packages/message-actions
```

Host 为原生 JavaScript。Client 源码位于 `src/client.js`，Markdown/GFM 渲染依赖已打包到发布的 `lib/client.js`，不依赖 CDN，也不重复打包 React。修改 Client 源码后在仓库根目录运行：

```bash
pnpm --filter dsh-message-actions build
```

`prepack` 会在打包发布前自动构建 Client。更新 Host 代码后，按 Plugin Manager 的结果决定是否重启 DSH，刷新浏览器加载新 Client。

## Agent 操作

`message_actions` 工具与界面共用 Host 操作方法：

- `get_settings`：读取当前专用模型、可用模型目录与目录错误。
- `save_settings {provider, model, reasoningEffort?}`：保存专用模型，provider/model 都用空字符串恢复沿用原回复。
- `inspect {messageId}`：读取调用者当前会话中的原回复与精确匹配的缓存。
- `generate {messageId, force?}`：使用固定 Wait, what? 提示词生成，默认复用缓存，`force: true` 绕过缓存。

不再提供模板增删改或自定义 prompt 参数。浏览器调用 owner 鉴权的 `POST /message-actions/op`，以 NDJSON 返回 `delta`、`done` 或 `error`，不写入原对话日志。若由 Agent 调用工具，工具调用仍按 DSH 的正常规则记入会话；一键按钮不走这个路径。

## English

**Wait, what?** appears beside each completed reply's feedback buttons. One click opens a cached explanation or starts an isolated model call. It adds missing context and explains the selected reply in plain language. No follow-up message, skill invocation or tool call is added to the original conversation.

This plugin has one fixed purpose and prompt, without custom templates or prompt editing. Select a dedicated model and optional reasoning effort on the plugin page or in the dialog's **Model settings**. By default it follows each original reply's model. The choice persists in the current profile and does not change the conversation model. A configured but unavailable provider reports an error instead of silently falling back.

Explanations render Markdown and GFM, including streamed text, tables, lists and code. Copy and cache retain the original Markdown. Raw HTML is not executed; images appear as links without automatic remote requests.

The latest 200 completed results persist on the Host. Exact text, model parameters and prompt reuse the cache; **Regenerate** bypasses it. The isolated call receives only the selected reply and preceding user message. It cannot access project files or tools. Prompts and results are stored as plaintext, and the selected text is sent to the chosen model service.

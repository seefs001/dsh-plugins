# dsh-message-actions

在每条已完成回复的点赞点踩旁加入 **Wait, what?**。点一下，插件用一次独立的模型调用把这条回复重新讲清楚，结果显示在弹窗里。不需要再发 `/wait-what`，不向主对话追加消息，不改原回复，也不占用主对话之后的上下文。

插件只做这一件事，使用固定的 Wait, what? 提示词，没有自定义模板，也不能编辑提示词。

## 使用

1. 点击回复底部的 **Wait, what?**。
2. 有匹配的缓存时立即显示，没有时自动开始生成。
3. 弹窗里可以停止、复制或重新生成。点弹窗外部、按 Esc 或点右上角 × 都能关闭，再次打开仍读取缓存。
4. 想换模型时，打开 **模型设置**，选好后点 **保存并解释**。

解释支持 Markdown 和 GFM，包括标题、列表、引用、链接、代码块、表格和任务列表，生成过程中实时渲染。复制和缓存保留原始 Markdown。原始 HTML 不会执行，图片显示为链接，不自动加载外部资源。

固定提示词改编自作者本地的 `wait-what` skill：补上读者缺失的前提和联系，把回复重新讲清楚。它不会只删字，也不会重新回答原问题。默认使用原回复的语言；英文遵循 ASD-STE100，其他语言使用同样的简明技术写作原则。

独立调用只读取所选回复和它之前最近一条用户消息的文本，不加载完整对话、系统提示词、其他技能或工具，也读不到项目文件。所以它沿用原文里的项目术语，不会假装读过 `GLOSSARY.md` 或 `GLOSSARY-MAP.md`。这两条消息缺少关键前提时，解释也可能不完整。

## 指定模型

在插件页面的 **Wait, what? 专用模型** 里设置，也可以从解释弹窗的 **模型设置** 进入。

| 选项 | 效果 |
| --- | --- |
| 沿用每条原回复的模型 | 默认值。使用那条回复的 provider、model 和对应请求的推理强度 |
| 指定模型 | 从 DSH 已配置的模型里选一个，只用于 Wait, what?，不改主对话的模型 |
| 推理强度 | 所选模型支持时可选。“模型默认”使用该模型当前的默认值，不继承另一个模型的强度 |

在插件页面保存后，下一次解释使用新设置；弹窗里的 **保存并解释** 会按新设置读取缓存或开始生成。

设置通过 DSH 的 config editor 保存到当前 profile，所有会话共用，刷新和重启后保留。插件只写自己的 `provider`、`model`、`reasoningEffort`，不直接改写 profile 文件。provider 和 model 为空表示沿用原回复。保存失败时会明确报错。指定的 provider 不可用时，插件提示你修改设置，不会悄悄改用原模型。模型列表刷新失败时会显示原因。

保存期间不能重复提交，弹窗保存时也暂时不能关闭或开始生成。保存成功才使用新模型，失败时保留草稿。生成中途可以停止或关闭弹窗，未完成的内容不会覆盖旧缓存。

## 缓存与隐私

- 结果保存在 Host 的 `message_actions` storage domain，刷新浏览器、重启 DSH 后仍在，多个浏览器共用。
- 缓存键包含会话、消息、原回复、上一条用户消息、解析后的模型参数和固定提示词。换模型或推理强度后分别缓存，切回来可以复用还在的旧结果。
- 最多保留最近 200 份完整结果。相同的键重新生成会替换旧结果，超出上限后按生成时间淘汰，没有自动过期。
- **重新生成** 跳过缓存。失败、中断、空输出或达到输出上限时，不完整的文本不会写入缓存，已有结果保留。
- 不启动 Agent，不执行工具。浏览器里的一键操作不会在主对话里产生用户消息、工具记录或二次解释。
- 提示词和结果明文保存在 Host。生成时，所选文本会发给指定的模型服务，没有指定时发给原回复的模型服务；不发送整个对话、附件或思考过程。浏览器里的操作只对 Host owner 开放。
- 从带自定义模板的旧版本升级时，旧模板不再读取或显示，插件也不会删除它们在磁盘上的记录。旧缓存只有和当前固定解释完全匹配时才复用。

## 安装与更新

需要 Web 界面和至少一个已配置的模型 provider。

```bash
dsh plugin --profile web add link:$PWD/packages/message-actions
```

Host 是原生 JavaScript。Client 源码在 `src/client.js`，Markdown/GFM 渲染依赖打包进发布用的 `lib/client.js`，不依赖 CDN，也不重复打包 React。修改 Client 源码后，在仓库根目录运行：

```bash
pnpm --filter dsh-message-actions build
```

`prepack` 会在打包发布前自动构建 Client。更新 Host 代码后，按 Plugin Manager 的结果决定是否重启 DSH，刷新浏览器加载新 Client。

## Agent 操作

`message_actions` 工具和界面共用 Host 上的操作：

- `get_settings`：读取当前专用模型、可用模型目录与目录错误。
- `save_settings {provider, model, reasoningEffort?}`：保存专用模型；provider 和 model 都传空字符串时恢复沿用原回复。
- `inspect {messageId}`：读取调用者当前会话里的原回复和完全匹配的缓存。
- `generate {messageId, force?}`：用固定提示词生成，默认复用缓存，`force: true` 跳过缓存。

工具没有模板管理或自定义提示词参数。浏览器调用带 owner 认证的 `POST /message-actions/op`，以 NDJSON 返回 `delta`、`done` 或 `error`，不写入原对话日志。Agent 调用工具时，这次调用按 DSH 的常规规则记入会话；一键按钮不走这条路径。

## English

**Wait, what?** appears beside each completed reply's feedback buttons. One click opens a cached explanation or starts an isolated model call. It adds missing context and explains the selected reply in plain language. No follow-up message, skill invocation, or tool call is added to the original conversation.

The plugin has one fixed purpose and prompt, with no custom templates or prompt editing. Select a dedicated model and optional reasoning effort on the plugin page or in the dialog's **Model settings**. By default it follows each original reply's model. The choice persists in the current profile and does not change the conversation model. If the configured provider is unavailable, the plugin reports an error and does not fall back silently.

Explanations render Markdown and GFM, including tables, lists, and code, while they stream. Copy and cache retain the original Markdown. Raw HTML is not executed; images appear as links without automatic remote requests.

The latest 200 completed results persist on the Host. A request with the same text, model parameters, and prompt reuses the cache; **Regenerate** bypasses it. The isolated call receives only the selected reply and preceding user message. It has no access to project files or tools. Prompts and results are stored as plaintext, and the selected text is sent to the chosen model service.

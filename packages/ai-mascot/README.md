# dsh-ai-mascot

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Web 界面右下角放置一只可拖拽的 GPT / Claude Q 版小伙伴，跟随当前所查看对话的思考、读文件、搜索、写代码、跑命令、委派协作、等待确认与完成状态实时切换动作。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/ai-mascot"
```

## 行为与交互

- **按模型显示**：模型 ID 匹配 `claude` 显示 Claude，匹配 `gpt` / `chatgpt` / `codex` / `o1` / `o3` / `o4` 显示 GPT，其余模型自动隐藏。
- **只看当前会话**：仅响应当前展示的对话，正常完成回复后庆祝 2.4 秒。
- **拖拽与设置**：支持拖拽与方向键微调（配合 `Shift` 大步移动）、收起为 40px 圆按钮、切换大小（小 / 标准）与开关动作动画，并遵守 `prefers-reduced-motion`。偏好保存在浏览器 `localStorage`（`dsh-ai-mascot:preferences`）。
- **图片加载**：首次显示时直接从 `selinlee.github.io` 加载角色参考图（无对话内容、无 referrer），并在浏览器内存中去除外围白底。

## Artwork and rights

本插件源码与包图标采用 [MIT 许可证](../../LICENSE)，**引用的角色形象与参考图不属于 MIT 授权范围**，受原作者非商业条款约束：

- 角色原设：[ZipZipPipe](https://www.pixiv.net/users/18604994)（[原作合集](https://www.pixiv.net/artworks/148186519)），遵守署名及禁止商业用途要求（`LicenseRef-ZipZipPipe-NC`）。
- Q 版参考图托管：[AI Moe Atlas](https://selinlee.github.io/ai-moe-atlas/zh/chibi/)（`super-chibi-v1`：[GPT](https://selinlee.github.io/ai-moe-atlas/generated/super-chibi-v1/openai/preview.webp)、[Claude](https://selinlee.github.io/ai-moe-atlas/generated/super-chibi-v1/claude/preview.webp)，见[版权声明](https://github.com/SelinLee/ai-moe-atlas/blob/main/RIGHTS.md)）。
- 如需商业使用、二次分发或发布衍生形象，请先取得原作者授权或替换 `lib/client.js` 中的 `ART` 图片地址。本插件及角色形象均非 OpenAI 或 Anthropic 官方产品。

详细文档见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/ai-mascot)。

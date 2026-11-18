# dsh-ai-mascot

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Web 界面右下角放置一个可拖拽的 GPT / Claude Q 版小伙伴，实时响应当前所查看对话的思考、读文件、搜索、写代码、跑命令、委派协作、等待确认与完成动作。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Web（Host 入口仅用于加载 bundle） |
| 生效模型 | 模型 ID 匹配 GPT / ChatGPT / Codex / o1 / o3 / o4 或 Claude 时显示；其他模型不显示 |
| 数据保存 | 位置、大小、收起状态与动画开关存于浏览器 `localStorage`（`dsh-ai-mascot:preferences`） |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/ai-mascot"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/ai-mascot"
```

## 交互与行为

- **跟随当前会话**：仅观察当前画面展示的会话（在正在运行的多个工具间取最近一次活跃调用），完全忽略其他后台会话。
- **动作映射**：区分待机、思考、写回复、读文件/网页、搜索、写代码、终端命令、协作委派、等待人工确认、正常完成庆祝（2.4 秒后回待机，停止或报错不庆祝）与报错提示。
- **拖拽与无障碍**：可拖拽或聚焦后使用方向键（配合 `Shift` 大步移动）调整位置；支持收起为 40px 按钮、切换尺寸（小 / 标准）、关闭动作动画，并遵守系统 `prefers-reduced-motion`。
- **隐私与网络**：仅首次显示时向 `selinlee.github.io` 发起普通图片请求（无对话数据、无 referrer），图片在浏览器内存中实时去除白底边缘后绘制，不上传也不打包本地。

## Artwork and rights

本插件的源码与包图标采用仓库的 [MIT 许可证](../../LICENSE)，**引用的角色形象与参考图不包含在 MIT 授权内**，受原作者非商业条款约束：

- 角色原设：[ZipZipPipe](https://www.pixiv.net/users/18604994)（[原作合集](https://www.pixiv.net/artworks/148186519)），遵守署名及禁止商业用途要求（`LicenseRef-ZipZipPipe-NC`）。
- Q 版参考图托管：[AI Moe Atlas](https://selinlee.github.io/ai-moe-atlas/zh/chibi/)（`super-chibi-v1` 系列：[GPT](https://selinlee.github.io/ai-moe-atlas/generated/super-chibi-v1/openai/preview.webp)、[Claude](https://selinlee.github.io/ai-moe-atlas/generated/super-chibi-v1/claude/preview.webp)，见[版权声明](https://github.com/SelinLee/ai-moe-atlas/blob/main/RIGHTS.md)）。
- 如需商业使用、二次分发或公开发布衍生形象，请先取得原作者授权或替换 `lib/client.js` 中的 `ART` 图片地址。本插件及角色形象均非 OpenAI 或 Anthropic 官方产品。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/ai-mascot)。

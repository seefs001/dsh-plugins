# dsh-image-gen

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）新增 `openai_image` 与 `grok_image` 画图工具，复用 `llm-pi-ai` 中已有 `openai-responses` provider 的接口与密钥调用托管 `image_generation`，并将生成的图片保存为本地文件及 DSH 会话附件。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | `llm-pi-ai` 中配置有 `api: openai-responses` 的 provider 及对应密钥 |
| 数据保存 | profile 的 `cordis.patch.yml` + 磁盘目录（默认 `generated-images/`）与 DSH 附件存储 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/image-gen"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/image-gen"
```

## 工具与参数

| 工具 | 托管能力 | 模型可传参数 |
| --- | --- | --- |
| `openai_image` | OpenAI `image_generation` | `prompt`、`size`（`auto` / `1024x1024` / `1536x1024` / `1024x1536`）、`quality`（`auto` / `low` / `medium` / `high`）、`background`（`auto` / `opaque` / `transparent`）、`output_format`（`png` / `jpeg` / `webp`；透明背景需 `png` 或 `webp`） |
| `grok_image` | xAI `image_generation` | `prompt`、`aspect_ratio`（`1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`3:2`、`2:3`、`2:1`、`1:2`、`21:9`） |

## 配置与边界

- 在 **Plugins → dsh-image-gen** 分别启用 `OpenAI` / `Grok` 后端，选择对应的 `openai-responses` provider、模型以及图片输出目录（`outputDir`，相对路径不能越出工作目录，默认 `generated-images`）。
- 仅支持实际魔数为 PNG、JPEG、WebP 或 GIF 的图片输出。
- 图片会写入会话工作目录下的 `outputDir` 并存入 DSH 附件以在界面中显示；只有当前对话模型声明支持 `image` 输入时，工具才会把图片块一并回传给该模型（否则仅返回文件路径与改写后的提示词）。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/image-gen)。

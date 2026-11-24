# dsh-image-gen

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）新增 `openai_image` 与 `grok_image` 画图工具，复用 `llm-pi-ai` 中已有的 `openai-responses` provider 调用托管 `image_generation`，并保存为本地文件与会话附件。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/image-gen"
```

## 工具与参数

| 工具 | 参数 |
| --- | --- |
| `openai_image` | `prompt`、`size`（`auto` / `1024x1024` / `1536x1024` / `1024x1536`）、`quality`（`auto` / `low` / `medium` / `high`）、`background`（`auto` / `opaque` / `transparent`）、`output_format`（`png` / `jpeg` / `webp`；透明背景需 `png` 或 `webp`） |
| `grok_image` | `prompt`、`aspect_ratio`（`1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`3:2`、`2:3`、`2:1`、`1:2`、`21:9`） |

## 配置

1. 在 `llm-pi-ai` 中准备好至少一个 `api: openai-responses` 的 provider 及其密钥。
2. 在 **Plugins** 页面打开 **dsh-image-gen**，启用 OpenAI / Grok 并选择 provider、模型和图片输出目录（`outputDir`，默认 `generated-images`，相对路径限制在会话工作目录内）。

仅接受 PNG、JPEG、WebP 或 GIF 输出。图片写入工作目录下的 `outputDir` 并存入 DSH 附件；当前对话模型声明支持 `image` 输入时，结果会一并附带图片块。配置保存在 profile 的 `cordis.patch.yml`。

详细文档见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/image-gen)。

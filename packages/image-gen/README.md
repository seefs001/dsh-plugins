# dsh-image-gen

Image generation tools for DSH. On the Plugins page, pick a local Responses model for each tool. The tool calls that model's hosted `image_generation` tool, saves the image to a file, and shows it in the conversation. No image model id is needed; the server picks it.

| Tool | Hosted tool | Parameters the model can pass |
|---|---|---|
| `openai_image` | OpenAI `image_generation` | size, quality, background, output format |
| `grok_image` | xAI `image_generation` (Grok Imagine) | aspect ratio |

There are two tools because the vendors' hosted tools take different parameters. xAI's tool has no size field, so `aspect_ratio` is appended to the prompt. Only `prompt` is required; every optional field can be omitted or set to `null`. One call generates one image.

## Install

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/image-gen"
```

## Configure

Open **Plugins → dsh-image-gen**:

- **Output directory**: where images are written, relative to the session working directory or absolute. Default `generated-images`.
- **Enabled**: turning it off removes the tool.
- **Model**: any model on an `openai-responses` provider in llm-pi-ai that can call hosted `image_generation`, for example a GPT model for OpenAI or a Grok model for xAI. The endpoint (`baseURL`), key (`apiKeyEnv`), and extra `headers` come from that provider.

Saving restarts the plugin and re-registers the tools. A tool is offered only while its provider route exists and its key resolves; the page shows **Ready** or the reason it is not. Readiness does not probe whether the upstream supports `image_generation`.

The same settings in `cordis.patch.yml`:

```yaml
- id: image-gen
  config:
    timeoutMs: 300000
    outputDir: generated-images
    openai:
      enabled: true
      provider: responses
      model: gpt-6.1-sol
    grok:
      enabled: true
      provider: responses
      model: grok-4.7-build-fast
```

## Request

OpenAI requests force the tool with `tool_choice: {"type": "image_generation"}` and `action: "generate"`. xAI documents no `tool_choice` for this tool, so Grok requests use `action: "generate"` and an instruction to call it once. If the model answers without an image, the tool fails with the model's text.

## Result

Each image is written as `<tool>-<UTC time>-<id>.<ext>` and stored in DSH's attachment store. The model receives the file path and the prompt the image model used (OpenAI `revised_prompt`, xAI `prompt`). It also receives the image when its route declares image input; a text-only model gets the path only. The Chat shows the built-in image row with the result.

## Caveats

- Whether a gateway forwards hosted `image_generation` depends on the gateway and the upstream account. An unsupported tool returns the endpoint's HTTP error.
- Each call bills the chosen Responses model plus the image generation.
- Files are written with Node on the Host machine. Remote execution worlds such as SSH are not supported.
- Only new images; editing and reference images are not exposed.

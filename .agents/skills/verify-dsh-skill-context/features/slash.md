# 斜杠直接调用

用户自己点名 Skill 时，不应再要求模型先调用加载工具。

## Sub-features

- `slash`：对照会话动作和端点实收请求。

## How to get to it (user POV)

在 headless 输入完整独立的 /sample-context；它是用户文本，不是模型的工具参数。

## Driving it with DSH headless

Preconditions: Doctor 通过；使用 helper 自建的合成 Skill，不复用已有会话。

```sh
.agents/skills/verify-dsh-skill-context/verify.py slash
```

核对 `events.ndjson` 和 `requests.json`：一次请求即有完整的具名指令，CLI 没有调用 skill 工具。

## Gotchas

种子必须允许用户调用；若发行版不处理这个入口，保留失败证据，不改成显式工具调用代替。

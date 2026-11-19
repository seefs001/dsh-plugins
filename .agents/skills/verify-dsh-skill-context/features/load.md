# 显式加载 Skill

模型通过公开的 skill 工具读取指令。工具结果应出现在随后真正发出的请求里。

## Sub-features

- `load`：对照会话动作和端点实收请求。

## How to get to it (user POV)

从 headless 提交“Load the sample-context skill using the skill tool.”；模型端点按协议请求 skill(name=sample-context)。

## Driving it with DSH headless

Preconditions: Doctor 通过；使用 helper 自建的合成 Skill，不复用已有会话。

```sh
.agents/skills/verify-dsh-skill-context/verify.py load
```

核对 `events.ndjson` 和 `requests.json`：两次请求。CLI 出现同一 callId 的 tool_call 与 completed tool_result；正文可见性从 false 变为 true。

## Gotchas

不要把模型生成工具参数或 CLI 显示成功当作模型看过正文；要检查第二次请求。

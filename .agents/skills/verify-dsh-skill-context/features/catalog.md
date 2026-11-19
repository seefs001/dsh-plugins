# Skill 目录

普通问题会让模型看到可用 Skill 的说明，但不会提前加载全部正文。

## Sub-features

- `catalog`：对照会话动作和端点实收请求。

## How to get to it (user POV)

在包含项目 Skill 的目录从 headless 发送普通问题；这个入口没有斜杠或工具请求。

## Driving it with DSH headless

Preconditions: Doctor 通过；使用 helper 自建的合成 Skill，不复用已有会话。

```sh
.agents/skills/verify-dsh-skill-context/verify.py catalog
```

核对 `events.ndjson` 和 `requests.json`：一次请求，has_catalog_description 为 true，has_body 和 has_named_block 为 false。

## Gotchas

目录说明本身会提到通用的 skill_content 标签；只搜索标签名会误判。

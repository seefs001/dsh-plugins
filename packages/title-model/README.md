# dsh-title-model

Choose a separate model for DSH session titles. The conversation model, title prompt, generation cadence, limits and user-pinned titles stay unchanged.

## Install

Requires DSH 0.2.2-rc.3 or later within 0.2.x, with either the native first-prompt title generator or **Conversation-following titles** enabled.

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/title-model"
# From a local clone:
dsh plugin --profile web add "link:$PWD/packages/title-model"
```

Follow Plugin Manager’s application result. Refresh the page to load the browser half.

## Use

1. Open **Plugins → Title model**.
2. The page shows the active supported title generator. Pick a model from the Host’s model catalog and click **Save**.
3. Choose **Same as session** and save to clear the explicit route. This removes both native override fields rather than saving empty strings.
4. Use **Reload settings** after switching title generators elsewhere. Reload discards the page’s unsaved selection. Each generator keeps its own saved route; this plugin does not copy it to a replacement generator.

Saving affects subsequent title requests across the Host. It does not immediately regenerate existing titles or unpin manually renamed sessions. The native provider still selects its least supported reasoning effort; this plugin does not override it.

If a configured model disappears, the page keeps its saved identity visible as unavailable and still allows **Same as session**. Generation failures retain the existing title; there is no silent fallback to a different provider.

## Persistence and privacy

The plugin has no model configuration or storage domain of its own. It locates native title-provider entries by package name, then uses DSH’s config editor to change only their `provider` and `model` fields. Other configuration fields and YAML expressions are preserved. The editor validates the configuration, reconciles the Loader and reports write failures.

**Disabling or removing this settings plugin does not reset the native generator’s configuration.** Select **Same as session** and save before removal if you want to clear the override.

Eligible human prompts used by the active title strategy go to the selected provider in separate, potentially billable requests. The native title subsystem owns input budgets, cancellation, request records and accepted-title persistence; this plugin never intercepts LLM streams or writes session events.

The browser endpoints `GET /title-model/state` and `POST /title-model/set` require the authenticated browser owner. No API key is stored by this plugin.

## Agent tool

When the preset exposes the registered tool, `title_model` uses the same Host operation as the page:

```json
{ "action": "get" }
{ "action": "set", "generator": "session-title-llm", "provider": "my-provider", "model": "my-model" }
{ "action": "set", "generator": "session-title-llm", "provider": "", "model": "" }
```

Use a generator id returned by `get`; ids can differ by profile. Omit `generator` only when exactly one supported generator is available. Changes are Host-wide, not per-session.

## Boundaries

- Supports `@deepseek-ai/dsh-session-title-first-prompt-llm` and `@deepseek-ai/dsh-session-title-all-prompts-llm`. It does not activate, replace or configure other title providers.
- Requires the profile config editor. A disabled or failed native generator must be enabled or fixed separately.
- Model catalogs can be partial; the page reports provider discovery failures without hiding available models.

---

## 中文

为 DSH 的对话标题单独选择模型，不改变主对话模型、标题提示词、生成频率、输入输出限制或手动固定的标题。

### 使用

1. 先启用 DSH 原生首条消息标题生成器，或官方的“随对话更新标题”功能。
2. 打开 **插件 → 标题模型**，从 Host 的模型目录中选择模型并保存。
3. 选择 **跟随会话** 并保存，会删除标题生成器的 `provider` 和 `model` 覆盖，恢复会话模型。
4. 在别处切换标题生成器后，点击 **重新加载设置**。重新加载会放弃页面未保存的选择。两个生成器各自保存配置，不会自动迁移模型。

保存对当前 Host 后续的标题请求生效，不会立即改写已有标题，也不会解除手动命名。推理强度仍由原生标题生成器选择该模型支持的最低档位。

### 配置与边界

配置保存在原生标题生成器所在行，而不是本插件所在行。本插件通过 DSH config editor 仅修改 `provider/model`，保留其他配置和 YAML 表达式，不拦截模型请求。

**禁用或移除本插件仍会保留已保存的模型。** 如需恢复会话模型，请先选择“跟随会话”并保存。

标题请求会把当前策略所需的用户消息发送给所选 provider，可能产生独立费用。模型不可用或生成失败时保留原有标题，不会静默回退到其他 provider。主对话和其他辅助模型调用不受影响。

页面只显示受支持、未禁用且已加载的原生标题生成器，不会自动启用或替换它们。Agent 可以通过 `title_model` 的 `get/set` 操作读取或修改相同设置；预设需允许该工具。修改是 Host 级设置，不限于当前会话。

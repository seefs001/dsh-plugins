# dsh-subagent-model

Adds a read-only model label to the lower-right composer controls of an addressed subagent session. Ordinary sessions keep the built-in model picker. The plugin runs in the Web GUI; its Host entry is empty and exists only so the bundle loads.

English | [中文](<#子代理模型>)

## Requirements

- DSH `>=0.2.2-rc.1 <0.3.0` and Node.js `^22.19.0` or `>=24`.
- The Web GUI (`dsh web`) with the built-in conversation, model-selection, and locale services.
- No extra provider credentials, experimental bundle, or companion plugin.

## Install

Install into the profile your Web GUI uses, here `web`:

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/subagent-model"
```

You can paste the same GitHub spec into the **Plugins** page. The GitHub spec installs what is on `main`. For local changes that are not pushed yet, run this from the repository root:

```bash
dsh plugin --profile web add link:$PWD/packages/subagent-model
```

Enabling the bundle affects every session in that profile. The package has no external dependencies, install scripts, or build step. If Plugin Manager reports `restart-required`, restart that profile before checking the Web page.

## Use and display

Open a subagent's conversation. Its composer shows the recorded model name and reasoning effort. Hover over the label for the provider and model IDs and a note that the label is read-only. There is no dropdown arrow and no way to switch models from it.

- The selection comes from the child session's durable `modelSelection` projection: `next`, or `lastUsed` when `next` is absent. The parent's model and the global default are never used.
- The model catalog supplies readable model and effort names. Models and efforts missing from the catalog show their IDs.
- With no recorded effort, the label shows the catalog's advertised default, as the main picker does. If the model supports reasoning but declares no default, it shows "Provider default". The advertised default is display metadata; it does not prove which effort the provider used.
- Before the child has a recorded selection, the label shows "Model not recorded yet" and does not guess a route.
- Font, height, and theme colors follow the built-in label. Long text is truncated, and the composer's compact mode shows a model icon instead. English and Chinese follow the UI language.
- Main-agent sessions keep their picker. The plugin does not change routing, reasoning effort, prompts, or model settings, and it sends no model requests.

## Implementation and data

The plugin registers its own `conversation.input.right` cell, ordered after the service-tier toggle when that plugin is installed. It does not replace `conversation.input.model` or the composer. It reads the shared model directory only for metadata and never treats the directory's `current` selection as the child's route.

There is no plugin configuration, custom storage, or browser preference. UI subscriptions follow the displayed session. The icon is original MIT-licensed SVG artwork.

## Troubleshooting and removal

- Main-agent conversations show no new label. Open the subagent's own conversation; its tool-call summary is not enough.
- If a subagent shows no label, check the profile, that the bundle is enabled, and the built-in UI services. Refresh the page after activation, and finish any pending restart first.
- "Model not recorded yet" means the child's projection has no selection yet. It is not a provider error, and the parent's model is not substituted.
- Raw IDs mean the catalog has no matching metadata. They do not change the route or mean the recorded model is invalid.

Disable or remove **Subagent model** (`dsh-subagent-model`) in Plugin Manager to restore the original UI. Existing sessions and model settings stay as they are.

## 子代理模型

在子代理输入框右下角显示只读的模型名和推理强度。普通会话仍使用原来的模型选择器。标签没有下拉箭头，也不能用来换模型。只在 Web 界面显示。

### 安装与使用

需要 DSH `>=0.2.2-rc.1 <0.3.0`、Node.js `^22.19.0` 或 `>=24`，以及内置的对话、模型选择和语言服务。不需要额外的 API key、实验 bundle 或配套插件。

上面的 GitHub 命令安装的是 `main` 上的版本。本地改动还没推送时，在仓库根目录运行上面的 `link:` 命令。请装进 Web 界面正在用的 profile，启用后会影响该 profile 的所有会话。Plugin Manager 提示需要重启时先重启，再打开子代理会话查看右下角。悬停可以看到 provider/model ID 和只读说明。

### 显示与数据边界

- 模型取自子代理自己持久化的 `modelSelection` projection，先用 `next`，没有时用 `lastUsed`，不会拿主代理或全局默认模型代替。
- 模型目录只提供易读的模型名和推理强度名，目录里没有时显示原始 ID。
- 没有记录推理强度时，和主代理选择器一样显示目录声明的默认值；支持推理但没有声明默认值时，显示“提供方默认”。目录默认值只是显示信息，不代表 provider 实际用了它。
- 还没有模型记录时显示“尚无模型记录”。这不是请求失败，也不会套用主代理的模型。
- 字号、高度、主题颜色和紧凑模式沿用内置标签，中英文跟随界面语言。
- 不改模型路由、提示词或设置，不发起模型请求，没有插件配置、自定义存储或浏览器偏好。

没有显示时，先确认打开的是子代理本身、profile 正确、bundle 已启用，再刷新页面；如果插件管理器提示需要重启，先重启。停用或移除“子代理模型”即可恢复原界面，已有会话和模型设置不变。

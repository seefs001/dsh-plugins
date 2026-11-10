# Subagent model

Adds a read-only model label to the lower-right composer controls of addressed subagent sessions. Ordinary sessions keep the built-in model picker unchanged. **Web** only; the empty Host entry exists for bundle loading.

English | [中文](<#子代理模型>)

## Requirements

- DSH `>=0.2.2-rc.1 <0.3.0` and Node.js `^22.19.0` or `>=24`.
- The Web GUI (`dsh web`) with the built-in conversation, model-selection and locale services enabled.
- No additional provider credentials, experimental bundle or companion plugin required.

## Install

Install into the profile used by your Web GUI, shown here as `web`:

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/subagent-model"
```

You can paste the same GitHub spec into the **Plugins** page. The GitHub command requires the package to exist on `main`. For unpublished local changes, run this from the repository root instead:

```bash
dsh plugin --profile web add link:$PWD/packages/subagent-model
```

Enabling the bundle affects every session in that profile. This package has no external dependencies, install scripts or build step. Follow the plugin manager's activation result; if it requires a restart, restart that profile before checking the Web page.

## Use and display

Open a subagent's conversation. Its composer shows the recorded model name and reasoning effort. Hover over the label to see the provider/model IDs and the read-only explanation. There is no dropdown arrow or model-switching action.

- Model selection comes from the child session's durable `modelSelection` projection (`next`, falling back to `lastUsed`), not the parent or global default.
- Catalog metadata supplies friendly model and effort names. Unlisted models and recorded efforts retain their IDs.
- If no effort is explicitly recorded, the label uses the catalog's advertised default, matching the main picker. If reasoning is supported but no default is declared, it shows “Provider default”. An advertised default is display metadata, not proof of a provider's runtime choice.
- Before a child has a recorded selection, it shows “Model not recorded yet” rather than guessing a route.
- Font, height and theme colors follow the built-in label. Long text truncates; the composer's compact mode switches to a model icon. English and Chinese follow the active UI language.
- Main-agent sessions keep their original picker. This plugin does not modify routing, reasoning effort, prompts or model settings, and does not issue model requests.

## Implementation and data

The plugin registers its own `conversation.input.right` cell after the service-tier toggle, if present. It does not replace `conversation.input.model` or the composer. The shared model directory is read only for metadata; its `current` selection is never used as the child's route.

There is no plugin configuration, custom storage or browser preference. The Host entry is empty; UI subscriptions follow the displayed session. The package icon is original MIT-licensed SVG artwork.

## Troubleshooting and removal

- No new label in a main-agent conversation is expected. Open the subagent itself, not just its tool-call summary.
- If the subagent label is missing, confirm the profile, enabled bundle and built-in UI services. Refresh the Web page after activation; if the plugin manager reports a pending restart, complete it first.
- “Model not recorded yet” means the child's projection has no selection yet. It is not a provider error and is not filled with the parent's model.
- Raw IDs mean matching catalog metadata is unavailable; they do not switch the route or imply the recorded model is invalid.

Disable or remove **Subagent model** (`dsh-subagent-model`) in the plugin manager to restore the original UI. Existing sessions and model settings remain unchanged.

## 子代理模型

在子代理输入框右下角补上只读模型名和推理强度。普通会话仍使用原来的模型选择器，标签没有下拉箭头，也不能点击选模。仅在 Web 界面显示。

### 安装与使用

要求 dsh `>=0.2.2-rc.1 <0.3.0`、Node.js `^22.19.0` 或 `>=24`，以及内置对话、模型选择和语言服务。不需要额外 API Key、实验 bundle 或配套插件。

上面的 GitHub 命令适用于已合入 `main` 的版本。尚未发布时，在仓库根目录执行上面的本地 `link:` 命令。安装到 Web 正在使用的 profile；启用后影响该 profile 的所有会话。按插件管理器返回的结果处理待重启状态，再打开子代理会话查看右下角。悬停可查看 provider/model 标识及只读说明。

### 显示与数据边界

- 模型来自子代理自身的 `modelSelection` 持久投影，优先使用 `next`，其次使用 `lastUsed`，不会拿主代理或全局默认模型代替。
- 模型目录只提供易读名称和推理强度名称。元数据缺失时显示记录中的原始 ID。
- 没有显式记录推理强度时，与主代理选择器一样显示模型目录声明的默认值；支持推理但未声明默认值时显示“提供方默认”。目录默认值不代表已确认 provider 的实际运行选择。
- 尚无模型记录时显示“尚无模型记录”。这不是请求失败，也不会自动套用主代理的模型。
- 字号、高度、主题颜色和紧凑模式沿用内置标签的呈现规则，中英文跟随界面语言。
- 不修改模型路由、提示词或设置，不额外调用模型，没有插件配置、自定义存储或浏览器偏好。

如果没有显示，先确认打开的是子代理本身、profile 正确且 bundle 已启用，再刷新 Web 页面。若插件管理器提示需要重启，先处理该状态。停用或移除“子代理模型”即可恢复原界面，不改变已有会话和模型设置。

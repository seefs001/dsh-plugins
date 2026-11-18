# dsh-roles

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 中创建和管理「角色」（系统提示词 + 专属技能 + 本地技能引用），并在每个会话的模型菜单里随时切换。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | `@deepseek-ai/dsh-storage-domain` |
| 数据保存 | Host `roles` storage domain（`global` 存角色库，`sessions` 存会话选择） |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/roles"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/roles"
```

## 内置角色

首次启动时会自动写入 4 个可编辑的内置角色（支持单条重置或一键恢复缺失内置角色）：

| 角色 | 说明 | 自带技能 |
| --- | --- | --- |
| 🔍 **代码审查员**（`code-reviewer`） | 按正确性、安全、可维护性审查改动 | `review-checklist`、`security-review` |
| 🏛️ **架构师**（`architect`） | 厘清约束与取舍，输出模块边界与演进方案 | `adr-writing`、`interface-design` |
| 🐛 **调试专家**（`debugger`） | 复现、定位根因与最小修复 | `debug-loop` |
| ✍️ **技术写作**（`tech-writer`） | 面向读者写清结论、步骤与边界 | `doc-structure` |

## 用法

- **会话内切换**：点击输入框底部模型菜单中的 **角色** 一行即可切换（或切回「不使用角色」），从下一步模型请求起生效。切换角色不改变模型、不重启会话，对同一角色库的编辑实时通过 SSE 同步到所有浏览器。
- **侧栏角色管理**：在左侧栏打开 **角色**，可新建、编辑、复制、排序、删除角色：
  - **提示词**：Markdown 格式（单角色上限 40,000 字符），通过 `systemPrompt.section`（`order: 5`）注入当前会话系统提示词。
  - **角色自带技能**：每个角色最多带 20 个内联技能（kebab-case 名称，单技能内容上限 60,000 字符），仅在选中该角色的会话 `skill` 目录中可见（支持热更新）。
  - **本地技能引用**：按名称引用本机已发现的技能（最多 20 个），不复制文件，不限制其他会话技能。
  - **预览**：保存前直接查看拼装后的提示词与技能条目。
- **Agent 工具**：插件同时注册 `roles` 工具（支持 `list`、`get`、`catalog`、`preview`、`create`、`update`、`duplicate`、`delete`、`move`、`select`、`reset`、`restore_builtins`），仅在用户要求时操作。

## 容量限制

- 角色库最多保存 **100** 个角色；会话选择记录最多保留最近 **2000** 条，删除角色时会自动清理失效关联。
- 子代理会话不独立切换父级角色入口（子代理可通过 `roles` 工具读取）。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/roles)。

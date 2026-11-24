# dsh-roles

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）中维护可复用的**角色**（系统提示词 + 专属技能 + 本地技能引用），并在每个会话的模型菜单中按需切换。

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

首次启用会写入 4 个可编辑的内置角色，支持单条重置与批量恢复缺失项：

| 角色 | 适用场景 | 自带技能 |
| --- | --- | --- |
| 🔍 **代码审查员**（`code-reviewer`） | 按正确性、安全与可维护性审查改动 | `review-checklist`、`security-review` |
| 🏛️ **架构师**（`architect`） | 厘清约束与取舍，设计模块边界与演进方案 | `adr-writing`、`interface-design` |
| 🐛 **调试专家**（`debugger`） | 复现、定位根因与最小修复 | `debug-loop` |
| ✍️ **技术写作**（`tech-writer`） | 编写面向读者的清晰技术文档 | `doc-structure` |

## 功能

- **会话内切换**：在输入框底部的模型菜单中点击**角色**即可切换或取消，从下一次模型请求起生效，并通过 SSE 同步到所有浏览器标签页。
- **`#` 快捷引用**：在输入框行首或空格后键入 `#`，按名称、ID 或简介筛选角色并插入引用标签（如 `#🔍 代码审查员`）；发送时展开为 `#role(id=..., name=...)` 并在历史消息中还原为标签，不切换当前会话角色。同时安装 [`dsh-model-reference`](../model-reference) 时会与模型列表合并在同一个 `#` 菜单中分组展示。
- **侧栏管理**：在左侧栏打开**角色**，新建、编辑、复制、排序或删除角色：
  - **提示词**：Markdown 格式（单角色上限 40,000 字符），注入当前会话的系统提示词。
  - **角色自带技能**：每个角色最多 20 个内联技能（单技能上限 60,000 字符），仅在使用该角色的会话中可见。
  - **本地技能引用**：按名称引用本机已发现技能（最多 20 个），不复制文件。
  - **预览**：保存前直接查看拼装后的系统提示词与技能条目。
- **Agent 工具**：提供 `roles` 工具（`list`、`get`、`catalog`、`preview`、`create`、`update`、`duplicate`、`delete`、`move`、`select`、`reset`、`restore_builtins`）。

详见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/roles)。

# dsh-subagent-peek

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）会话顶栏展示紧凑的子代理计数胶囊与派生树速览菜单。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Web |
| 前置依赖 | DSH 原生会话与子代理服务 |
| 数据保存 | 仅当前浏览器内存记录本次已查看的子代理圆点 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/subagent-peek"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/subagent-peek"
```

## 用法

- 当当前会话派生了子代理时，标题右侧显示计数胶囊（无子代理时自动隐藏）。
- 有子代理运行时前置脉动圆点；有子代理等待审批、提问或最近轮次失败时胶囊自动高亮提醒。
- 点击胶囊弹出按原始派生顺序组织的子代理树，显示每个节点的名称、运行耗时、待处理状态、失败标红或未查看完成圆点；点击行直接切入子代理，点击行尾侧看图标可在右侧栏打开。

更多说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/subagent-peek)。

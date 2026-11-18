# dsh-bark-notify

当 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）智能体暂停等待你介入时，通过 [Bark](https://bark.day.app/) 向手机发送推送通知，避免切走窗口或离开电脑时漏掉提问、计划审阅与权限审批。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | 可用的 Bark 服务器或 App Device Key |
| 数据保存 | 普通配置写入 `cordis.patch.yml`；Device Key 仅存于 Host 凭据 `bark-notify/device`（或 `DSH_BARK_KEY`） |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/bark-notify"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/bark-notify"
```

## 配置

打开 **Plugins → dsh-bark-notify**：

1. 在 **从 Bark URL 快速填入** 粘贴你的完整 Bark 链接点击 **解析填入**，或直接填写 **服务器地址**（默认 `https://api.day.app`）和 **Device Key**。
2. 点击 **保存** 后点击 **发送测试通知** 确认手机可达。
3. 可按需调整：**请求方式**（`GET` / `POST` JSON）、**触发场景**（`user-questions/request` 与 `approval/request` 独立开关）、**延迟推送（毫秒）**（`0`–`600000`，超时前已在界面处理则自动取消推送）、**声音与分组**、**正文包含问题或审批摘要**（关闭仅发送会话名与类型）以及 **点击通知跳转链接**。

## 边界与隐私

- 监听器以 `prepend` 方式旁路触发并立即 `next()`，推送失败仅记警告日志，绝不阻塞或打断原生交互与超时计时。
- Device Key 从不写入 `cordis.patch.yml`，配置接口仅返回脱敏预览，日志与错误自动抹去密钥；三个本地路由（`/bark-notify/state`、`set`、`test`）仅允许 `owner` 访问。
- `dsh-acp-workbench` 中的外部 ACP CLI 使用独立交互通道，不触发本插件。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/bark-notify)。

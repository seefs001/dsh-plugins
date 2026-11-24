# dsh-bark-notify

当 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）智能体暂停等待回答、计划审阅或权限审批时，通过 [Bark](https://bark.day.app/) 发送手机推送。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/bark-notify"
```

## 触发范围

- `user-questions/request`：`ask_user_question`、`exit_plan_mode` 计划审阅与界面授权卡片。
- `approval/request`：工具权限审批。

推送采用异步旁路触发，不阻塞原生交互与超时计时。外部 ACP CLI（`dsh-acp-workbench`）使用独立通道，不触发本插件。

## 配置

在 **Plugins** 页面打开 **dsh-bark-notify**：

1. 在 **从 Bark URL 快速填入** 粘贴完整 Bark 链接点击 **解析填入**，或手动填写 **服务器地址**（默认 `https://api.day.app`）与 **Device Key**（也可通过 `DSH_BARK_KEY` 凭据或环境变量提供）。
2. 保存后点击 **发送测试通知** 验证送达。
3. 可配置请求方式（`GET` / `POST` JSON）、触发场景开关、延迟推送（`0` 到 `600000` 毫秒，延迟内已处理则自动取消）、铃声与分组、是否在正文附带摘要，以及点击跳转链接。

普通配置保存在 `cordis.patch.yml`；Device Key 仅保存在本机 Host 凭据 `bark-notify/device` 中。

详细文档见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/bark-notify)。

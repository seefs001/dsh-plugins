# dsh-bark-notify

Sends a [Bark](https://bark.day.app/) push notification when a DSH agent pauses for human input:

- `user-questions/request` (`ask_user_question`, `exit_plan_mode` plan reviews, and UI approval cards)
- `approval/request` (tool permission approvals when the session policy is not `never`)

It prepends non-blocking listeners onto DSH's Cordis waterfalls, dispatches the HTTP push asynchronously, and immediately delegates to `next()` so the native UI, SDK bridge, and timed-question timers behave identically.

## Install

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/bark-notify"
```

From a local clone:

```bash
dsh plugin --profile web add "link:$PWD/packages/bark-notify"
```

## Configure

Open **Plugins → dsh-bark-notify**:

1. Paste a Bark URL template into **Quick fill from Bark URL** (such as `https://your-bark-host/YOUR_KEY/{{title}}/{{content}}?sound=alarm&group=channel_update`) and click **Fill fields**, or enter **Server URL** and **Device key** directly.
2. Click **Save**. The device key is saved in DSH credentials (`bark-notify/device`) and never written to `cordis.patch.yml`.
3. Click **Send test notification** to verify delivery.

For headless profiles without the Web GUI, you can also supply the device key via `DSH_BARK_KEY` in the process environment or DSH credentials (`ctx.credentials.resolve('DSH_BARK_KEY')`).

### Settings

- **Enabled**: Master switch.
- **Server URL**: Bark server origin (default `https://api.day.app`). Only `http://` and `https://` URLs without embedded credentials are accepted.
- **Request mode**:
  - `get`: `GET <serverUrl>/<key>/<title>/<content>?sound=...&group=...`
  - `post`: `POST <serverUrl>/<key>` with JSON `{ title, body, sound, group, url }`
- **Notify on**: Toggle `user-questions/request` and `approval/request` independently.
- **Delay (ms)**: Optional grace period (0 to 600,000 ms). If `delayMs > 0` and you answer or the request aborts before the timer fires, no Bark push is sent.
- **Sound / Group**: Optional Bark `sound` and `group` parameters (defaults: `alarm` and `dsh`).
- **Include question/tool summary in body**: When disabled, sends only the session name and request kind without question text, options, or tool reasons.
- **Click-through URL**: Optional `url` parameter passed to Bark so tapping the notification opens your DSH URL.

## Storage and privacy

- Non-secret settings live in the profile's `cordis.patch.yml`.
- The Bark device key is stored in DSH Host credentials (`bark-notify/device`) and is masked in `GET /bark-notify/state` and redacted from logs and error messages.
- HTTP endpoints (`/bark-notify/state`, `/bark-notify/set`, `/bark-notify/test`) accept `owner` principal connections only.
- When `includeContent` is enabled, truncated question titles/options or approval tool names/reasons are sent to the configured Bark server. Disable `includeContent` if you do not want prompt details sent over push notifications.

## Limitations

- External ACP agents inside `dsh-acp-workbench` use their own interaction state machine instead of `user-questions/request` or `approval/request`, so they do not trigger this plugin.
- Push errors are logged as warnings and never block or fail the agent turn.

## 中文

当 DSH 智能体通过 `user-questions/request`（提问、计划审阅、界面授权）或 `approval/request`（工具权限审批）等待你操作时，顺便向手机发送 Bark 推送。监听器只做前置旁路通知并立即 `next()`，不阻塞、不改写原生交互链路。

在 **Plugins → dsh-bark-notify** 页面粘贴 Bark URL 模板点击「解析填入」，或分别填写服务器地址与 Device Key 后点击「保存」即可。Device Key 只存在 Host 凭据（`bark-notify/device`）或环境变量 `DSH_BARK_KEY` 中，不会写入配置文件或仓库。

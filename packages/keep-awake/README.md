# dsh-keep-awake

Keep the macOS computer running the DSH Host awake while the plugin is enabled. The display can still sleep, and the screen can still lock. No administrator privileges, dependencies, configuration, or permanent power-setting changes.

## Requirements

- macOS with the built-in `/usr/bin/caffeinate` utility.
- DSH `>=0.2.2-rc.2 <0.3.0` and Node.js `^22.19.0 || >=24`.
- Runs on the **Host computer**, not the device viewing the Web GUI. On other operating systems, it logs a warning and does nothing.

## Install

In DSH's **Plugins** page, choose **Add plugin** and select this package's local directory. From a clone, the equivalent CLI command is:

```bash
dsh plugin --profile web add "link:$PWD/packages/keep-awake"
```

After the commit is pushed to GitHub, it can also be installed with:

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/keep-awake"
```

## Use

Enable **Keep awake / 保持唤醒** in **Plugins**. There are no settings or browser controls. Disable the plugin or quit the DSH Host to stop preventing idle sleep. Closing a browser tab does **not** stop a background Host.

## Lifecycle

The Host starts one `/usr/bin/caffeinate -i -w <host-pid>` process per active plugin instance:

- `-i` prevents automatic system idle sleep, on battery or AC power. It does not request display wakefulness.
- `-w` ties the assertion to the Host's PID, so the helper releases it when the Host exits, including after a crash or forced termination.
- Plugin disposal terminates and awaits the helper. Re-enabling starts a new helper.
- The helper is unreferenced, so it cannot keep an otherwise finished Host process alive.
- Startup failure fails plugin activation. An unexpected helper exit is logged without automatic retries; disable and re-enable the plugin to retry.

To inspect the current assertion on macOS:

```bash
pmset -g assertions
```

While active, `caffeinate` should own a `PreventUserIdleSystemSleep` assertion, not a `PreventUserIdleDisplaySleep` assertion. When the plugin is disabled, its assertion disappears. Other apps or DSH processes may still prevent sleep independently.

## Limitations

- Does not prevent lid-close, manual sleep, shutdown, or critical-battery behavior.
- Keeps the computer awake even when DSH is idle, which increases power use and battery drain. Disable it when you do not need it.
- Does not change screen-lock, display-sleep, disk-sleep, or permanent power preferences.
- This is a Host-only plugin. It does not depend on the Web GUI and adds no tools, sessions, timers, or network requests.

## 中文

启用后，运行 DSH Host 的 Mac 不会因闲置而自动休眠，但仍可正常息屏和锁屏。禁用插件或退出 Host 后，插件持有的防休眠断言会释放；即使 Host 崩溃退出也会释放。关闭浏览器页面不等于退出后台 Host。

在 **Plugins** 页启用或禁用即可，无需配置，不改系统的永久电源设置。只支持 macOS，不阻止合盖或手动休眠。持续保持唤醒会增加耗电。

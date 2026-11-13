# dsh-keep-awake

While the plugin is enabled, the Mac running the DSH Host does not fall into idle sleep. The display can still sleep, and the screen can still lock. It needs no administrator privileges, dependencies, or configuration, and it changes no permanent power settings.

## Requirements

- macOS with the built-in `/usr/bin/caffeinate` utility.
- DSH `>=0.2.2-rc.2 <0.3.0` and Node.js `^22.19.0 || >=24`.
- The plugin acts on the computer that hosts DSH; the device viewing the Web GUI is unaffected. On other operating systems it logs a warning and does nothing.

## Install

On DSH's **Plugins** page, choose **Add plugin** and select this package's directory. From a clone, the equivalent command is:

```bash
dsh plugin --profile web add "link:$PWD/packages/keep-awake"
```

To install the version pushed to `main` on GitHub:

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/keep-awake"
```

## Use

Enable **Keep awake** (**保持唤醒** in the Chinese UI) in **Plugins**. There are no settings or browser controls. Disable the plugin or quit the DSH Host to allow idle sleep again. Closing a browser tab does not stop a background Host.

## Lifecycle

The Host starts one `/usr/bin/caffeinate -i -w <host-pid>` process per active plugin instance:

- `-i` prevents automatic system idle sleep on battery and AC power. It does not keep the display awake.
- `-w` ties the assertion to the Host's PID, so it is released when the Host exits, including after a crash or forced termination.
- Disabling the plugin terminates the helper and waits for it to exit. Re-enabling starts a new helper.
- The helper is unreferenced, so it cannot keep a finished Host process alive.
- If the helper fails to start, plugin activation fails. An unexpected helper exit is logged and not retried; disable and re-enable the plugin to try again.

To inspect the current assertion on macOS:

```bash
pmset -g assertions
```

While the plugin is active, `caffeinate` holds a `PreventUserIdleSystemSleep` assertion and no `PreventUserIdleDisplaySleep` assertion. The assertion disappears when the plugin is disabled. Other apps or DSH processes may still prevent sleep on their own.

## Limitations

- Lid-close, manual sleep, shutdown, and critical-battery behavior are unchanged.
- The computer stays awake even while DSH is idle, which uses more power and battery. Disable the plugin when you do not need it.
- Screen-lock, display-sleep, disk-sleep, and permanent power preferences are unchanged.
- The plugin is Host only. It does not need the Web GUI and adds no tools, sessions, timers, or network requests.

## 中文

启用后，运行 DSH Host 的 Mac 不会因为闲置而自动休眠，显示器仍可熄灭，屏幕仍可锁定。停用插件或退出 Host 后，防休眠断言随即释放，Host 崩溃退出时也一样。关闭浏览器页面不会退出后台的 Host。

在 **Plugins** 页启用或停用即可，不需要配置，也不改系统的永久电源设置。只支持 macOS，不阻止合盖或手动休眠。一直保持唤醒会增加耗电。

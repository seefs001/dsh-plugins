# dsh-keep-awake

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Host 运行期间阻止 macOS 闲置休眠，保持显示器正常熄灭和锁屏。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host |
| 平台要求 | macOS（`/usr/bin/caffeinate`） |
| 数据保存 | 无 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/keep-awake"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/keep-awake"
```

## 工作方式

- Host 启动时运行 `/usr/bin/caffeinate -i -w <host_pid>`：`-i` 仅阻止系统闲置休眠，不影响显示器休眠、锁屏或盒盖睡眠；`-w <pid>` 绑定 Host 进程生命周期，停用插件或退出 Host 后自动释放。
- 在非 macOS 平台上输出警告日志并保持空转。

更多说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/keep-awake)。

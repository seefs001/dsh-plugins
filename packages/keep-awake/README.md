# dsh-keep-awake

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Host 运行期间阻止 macOS 闲置休眠，让长任务在后台稳定跑完，同时保持屏幕正常熄灭与锁屏。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host |
| 平台要求 | macOS（`/usr/bin/caffeinate`） |
| 数据保存 | 无配置或存储 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/keep-awake"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/keep-awake"
```

## 工作方式与边界

- Host 启动插件后执行 `/usr/bin/caffeinate -i -w <host_pid>`：
  - `-i` 只阻止系统闲置休眠，不影响显示器休眠、自动锁屏或盒盖休眠。
  - `-w <pid>` 绑定 Host 进程 PID，即使 Host 异常崩溃，系统电源断言也会自动释放，不会修改永久电源设置。
- 在非 macOS 平台上自动跳过并输出一条警告日志，不报错、不阻塞 Host 启动。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/keep-awake)。

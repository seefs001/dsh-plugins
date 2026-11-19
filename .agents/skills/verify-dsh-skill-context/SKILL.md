---
name: verify-dsh-skill-context
description: 验证 DSH headless 里 Skill 目录、显式加载及斜杠调用究竟把什么发给模型；改动 Skill 注入或排查重复加载时使用。
---

## Launch

从 dsh-plugins 仓库根目录运行。需要 Python 3.9+ 和 PATH 中的 dsh（已验证 0.2.2-rc.4）。这是一次性 CLI，不启动 Web。先跑 Doctor，然后从 [功能地图](features/README.md) 选一个入口。

## Doctor


```sh
.agents/skills/verify-dsh-skill-context/verify.py doctor
```

Doctor 在空的临时 HOME 下读 CLI 版本、headless 默认配置和帮助，并核对本仓库 Pi 仍使用同一 Skill 加载包。不会连接现用的 Web 实例。Doctor 通过只代表能启动；只有 Drive 捕获到预期请求并收到 CLI 的 final 事件才算可用。

## Drive


```sh
.agents/skills/verify-dsh-skill-context/verify.py catalog
.agents/skills/verify-dsh-skill-context/verify.py load
.agents/skills/verify-dsh-skill-context/verify.py slash
.agents/skills/verify-dsh-skill-context/verify.py repeat
.agents/skills/verify-dsh-skill-context/verify.py prune
.agents/skills/verify-dsh-skill-context/verify.py compact
```

每次执行自建临时工作目录、项目 Skill、空 DSH_HOME 和只监听 127.0.0.1 随机端口的 Messages 服务；以一次性值代替 API 凭证。启动真实的 `dsh headless --json --permission-mode read-only --approval-policy never`，工作目录不指向本仓库。仅模型服务按固定剧本回答；发现、加载、注入、请求序列化和会话持久化都由 DSH 完成。每次 run 独占目录和端口，可并行；不要改用已登录的 Web profile。

## Evidence

每次运行打印 `Evidence:` 路径，默认是 `reports/verify-dsh-skill-context/<入口>-<随机后缀>/`。核对四份材料：

- `action.json`：CLI 参数、运行版本和合成 Skill。正文标志句不出现在用户提示或目录说明里。
- `events.ndjson`：真实 CLI 的动作、工具结果与最终回复。失败时另看 `stderr.txt`。
- `requests.json`：**本地模型端点收到的请求**里是否有目录、具名块、完整的合成指令。只保存观测字段，不导出完整提示。工具返回成功不能替代这份证据。
- `result.json`：仅在行为断言通过、确认临时会话日志写入、清理完成后生成。没有它不能报通过。

临时 patch 加载工作区 Pi 的 skill-context 模块。`repeat` 驱动两次显式加载，模型只应看到一条名单；`prune` 调用真实的 DSH 裁剪服务；`compact` 把正文和旧提醒一起压缩，额外记录 `summary-request.json`。两者的最终请求都应看不到完整正文，并收到清空提示。`recall-input.ndjson` 捕获记忆插件所在 pre-step 阶段的拟发送消息：用户提示可见，新增名单不可见。它不是对在线记忆服务的调用。这里没有启动 Web、驱动完整 Pi 预设或调用生产模型，也不测性能。

## Cleanup

命令会关闭自己创建的监听器，退出或抛错时撤销临时工作目录和 profile；不要清理其他实例。成功后用 `result.json` 和同目录的 `requests.json` 确认证据仍在。

## Helpers

`verify.py` 是唯一的可执行入口。运行 `.agents/skills/verify-dsh-skill-context/verify.py --help` 查看子命令。需要把证据保留在仓库外时追加 `--evidence-dir /tmp/dsh-skill-proof`。

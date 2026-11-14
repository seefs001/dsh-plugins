# MoeJS 替换 Pi codemode 的 QuickJS：可行性调查

日期：2026-11-13，Asia/Singapore。

## 结论

**技术上可以做兼容后端，但不能直接替换依赖。目前建议保留 QuickJS。** 如果继续探索，应在 Pi codemode 的沙箱执行层做独立原型，保留原生工具参数、描述、采样策略、工具调用入口和结果格式。不要为迁移引擎引入 `{code,input}` 或新的模型侧 API。

本次只检查源码和文档。没有安装、构建或执行 MoeJS，没有更换引擎，也没有做性能或安全认证。研究固定到 [MoeJS 提交 934171643e14a785a9c03e8bee10f82e5e1de478](<https://github.com/MoeForge/moejs/tree/934171643e14a785a9c03e8bee10f82e5e1de478>)；本地 Pi coding-agent 和 pi-codemode 均为 1.5.0。

## 当前替换点

本地 Pi 的执行链是 `codemode → CodemodeSandbox → Node worker → quickjs-wasi`。原生执行器直接创建 `CodemodeSandbox`，传入 QuickJS WASM、worker 地址、工具、辅助函数、超时和 256 MiB VM 内存限额，执行结束后关闭沙箱。成功时才把 `store()` 写入记入会话。[Pi 执行器](<../packages/pi-tools/node_modules/@earendil-works/pi-coding-agent/dist/extensions/codemode/execute.js#L504-L550>)

pi-codemode 固定依赖 `quickjs-wasi@3.6.2`。其 VM 实现直接使用 QuickJS 的 API，不是通过一个任意 JavaScript 引擎接口调用。Node 后端每次执行创建独立 worker，通过中断标志和 worker 终止处理失控脚本。[依赖声明](<../node_modules/.pnpm/@earendil-works+pi-codemode@1.5.0/node_modules/@earendil-works/pi-codemode/package.json#L69-L71>)、[VM 实现](<../node_modules/.pnpm/@earendil-works+pi-codemode@1.5.0/node_modules/@earendil-works/pi-codemode/dist/runtime/vm.js#L1-L39>)、[worker 宿主](<../node_modules/.pnpm/@earendil-works+pi-codemode@1.5.0/node_modules/@earendil-works/pi-codemode/dist/runtime/host.js#L8-L31>)。

因此，最小合理改动位置是沙箱的 launcher/worker/VM 层，而不是 DSH 的工具参数层。Pi 已有远程沙箱和 JSON 消息协议，可以评估复用；但现有远程服务实现仍启动 QuickJS，不能把“已有 remote”当作“已有 MoeJS 后端”。原生 coding-agent 执行器也仍固定使用本地 `CodemodeSandbox`，集成需要上游扩展或维护兼容补丁。[远程实现](<../node_modules/.pnpm/@earendil-works+pi-codemode@1.5.0/node_modules/@earendil-works/pi-codemode/dist/runtime/remote.js#L12-L96>)、[消息协议](<../node_modules/.pnpm/@earendil-works+pi-codemode@1.5.0/node_modules/@earendil-works/pi-codemode/dist/runtime/protocol.d.ts#L1-L90>)。

## MoeJS 能提供什么

| 项目 | 一手资料中的事实 | 对 Pi 的意义 |
|---|---|---|
| 宿主 | 纯 Go，模块要求 Go 1.25；源码树没有 `package.json`。`node` 包是给 Go 内的 JS 提供文件系统和 Buffer，不是 Node 原生绑定。 | 当前仓库没有可直接替换 `quickjs-wasi` 的 npm 接口，需要另建宿主桥。 |
| 异步 | 支持 async/await、异步函数编译和宿主 Promise；Promise 结算只能在使用 runtime 的 goroutine 上进行。 | `await tools.*()` 具备实现基础，但 Node 工具结果不能直接从任意 goroutine 回填。 |
| 能力限制 | 裸 runtime 只有标准库和宿主安装的 globals；模块由宿主解析；网络、文件系统和计时器由附加包提供。 | 可以维持 Pi 的默认无文件系统、网络和计时器环境。迁移时不能顺手开放这些附加能力。 |
| 资源控制 | 提供 `Interrupt` 和 `Options.MemoryLimit`；内存统计是近似值。中断不会执行脚本的 catch/finally。 | 可以建立限制，但还须实现 DSH 超时、取消、未完成工具调用清理以及外层进程终止。不能宣称等同现有 WASM 隔离。 |
| 成熟度 | 项目明确处于 alpha，API 可能变化。部分语言和内建功能尚未实现，默认内建对象被冻结共享。 | 需要固定版本并验证 Pi 脚本行为。不能只凭“支持现代 JS”认定完全兼容。 |

来源：[Go 模块](<https://github.com/MoeForge/moejs/blob/934171643e14a785a9c03e8bee10f82e5e1de478/go.mod>)、[宿主能力与 Node 包](<https://github.com/MoeForge/moejs/blob/934171643e14a785a9c03e8bee10f82e5e1de478/README.md#L74-L136>)、[异步函数编译](<https://github.com/MoeForge/moejs/blob/934171643e14a785a9c03e8bee10f82e5e1de478/docs/guide.md#L615-L626>)、[Promise 实现](<https://github.com/MoeForge/moejs/blob/934171643e14a785a9c03e8bee10f82e5e1de478/promise.go#L29-L54>)、[中断和内存限制](<https://github.com/MoeForge/moejs/blob/934171643e14a785a9c03e8bee10f82e5e1de478/docs/guide.md#L100-L156>)、[安全策略](<https://github.com/MoeForge/moejs/blob/934171643e14a785a9c03e8bee10f82e5e1de478/SECURITY.md#L14-L38>)、[未支持项目](<https://github.com/MoeForge/moejs/blob/934171643e14a785a9c03e8bee10f82e5e1de478/TODO.md>)。

该提交的 README 开头写运行的 79,385 项 test262 全通过，后文写 80,971 项通过、14,268 项跳过，数字不一致。这些是项目自报结果，本次没有复跑。不能据此声称通过完整 ECMAScript 测试集，更不能把它当作 Pi 集成验证。[README 开头](<https://github.com/MoeForge/moejs/blob/934171643e14a785a9c03e8bee10f82e5e1de478/README.md#L16-L21>)、[语言支持与状态](<https://github.com/MoeForge/moejs/blob/934171643e14a785a9c03e8bee10f82e5e1de478/README.md#L370-L398>)。

## 性能证据不能直接用于这次决策

MoeJS 展示的是 Go 宿主中的插件调用、数据转换和内存测试，以及 C QuickJS 等对照。当前 Pi 用的是 Node worker 内的 QuickJS WASM，不是表格里的 Go 绑定。README 还明确写出，在其一项小请求测试里，直接从 C 调用的 QuickJS 比 MoeJS 快约 7%。所以“换成 MoeJS 一定更快”没有证据。[官方基准说明](<https://github.com/MoeForge/moejs/blob/934171643e14a785a9c03e8bee10f82e5e1de478/README.md#L23-L70>)

若采用 Go 子进程，需要计入启动、IPC、JSON 转换和 Go GC。对于等待 shell、文件操作或模型请求的 codemode，VM 执行耗时可能不是主要部分。这是工程判断，尚未测量。应比较当前后端与候选后端的冷启动、连续调用、并行异步工具、超时取消、P50/P95 和进程峰值内存，而不是外推宣传表格。

## 若继续，原型应该验证什么

以下是建议，不是本次实施内容。

1. 优先评估 **Node 宿主 + 独立 Go 子进程中的 MoeJS**。尝试复用 Pi 的消息语义和宿主控制层，不先发明新的工具 API。所有实际工具调用仍返回 DSH 原有准入和执行链。
2. 保持 `{code}`、原生 `constrainedSampling`、`// @options:`、顶层 await/return、`tools.*`、`text()`、`image()`、`store()/load()`、辅助 globals 和现有错误/部分输出语义。原生描述目前明确写 QuickJS；若以后真换默认引擎，也要经用户确认如实调整引擎说明，不能继续冒称 QuickJS。[原生工具说明](<../packages/pi-tools/node_modules/@earendil-works/pi-coding-agent/dist/extensions/codemode/tool.js#L1-L51>)
3. 首先验证异步并行、拒绝、取消、纯 JS 死循环、微任务死循环、内存超限，以及脚本结束时仍在运行的工具。权限、工具选择和会话存储必须保持现有所有权。若目标包括 Pi 的确定性恢复 API，还需实现其时间、随机数、结果顺序和引擎指纹语义，不能只兼容一次性执行。[原生 VM 的两种模式](<../node_modules/.pnpm/@earendil-works+pi-codemode@1.5.0/node_modules/@earendil-works/pi-codemode/dist/runtime/vm.js#L6-L36>)
4. 正确性和隔离通过后才比较端到端性能。没有明确收益就保留 QuickJS，避免增加 Go 二进制分发、跨语言异步桥和上游兼容维护。

## 与本次引号报错的关系

换引擎不解决原始问题。按 JavaScript 语法，未转义的内层引号仍会破坏字符串；已经被字符串解析消耗的反斜杠也不会因为换引擎而自动恢复。本轮修复的是 DSH 丢失 Pi 原生采样元数据的问题，原始错误脚本仍会在执行工具前失败。MoeJS 替换属于独立工程，不是这两次语法错误的修复方案。

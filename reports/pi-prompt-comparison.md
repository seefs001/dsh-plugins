# pi 预设与原生 Pi 的提示词对比

日期：2026-11-12。Pi 固定为 **1.5.0**，验证运行时为 **DSH 0.2.2-rc.2**。下列无 MCP 静态基线采样于 **dsh-pi-tools 0.2.0**；本次兼容性修订及安装版本为 **0.3.0**。

## 结论

预设显示名已改为 **pi**，id 仍为 `pi`。全局 `web` profile 和默认预设没有改名或切换。最终重装结果为 `application: applied`，bundle 已启用，Host 中仍有 `include:preset-pi` 声明。没有重启全局服务。

当前预设提供九个工具：

```text
read  bash  edit  write  grep  find  ls  codemode  tool_search
```

原版 Pi 的 QuickJS、工具参数预处理与验证、工具搜索、结构化返回及工具指南都已接入。MCP 复用现有 DSH 连接，预设选择 `nowledge_mem`，默认使用 `codemode` 披露方式。

它不是完整的 Pi CLI。会话、模型路由、权限、文件发布、MCP 传输和压缩仍由 DSH 管理。

## 如何比较

不能直接拿 Pi 的默认四工具配置与这里的九工具配置计算差异。因此对照统一为：

- 相同的九个工具和 Pi 1.5.0 实现。
- `codemode.mode = on`，原版内联预算 3000。
- 对等能力基线关闭 `models.*`，不接入 MCP，不加载项目指令和技能。
- 原生侧调用 Pi 的提示词构建器和 `prepareLoadout`；DSH 侧在真实 Cordis、Tools、SystemPrompt 等服务中组装声明。
- 安装目录和临时项目目录替换为统一占位符。工作目录段不计入静态正文，因为 DSH 将它作为运行时上下文提供。
- 另保留了原生 codemode 默认开启模型接口时的声明，以及当前 DSH 预设的 MCP 静态提示。

原始正文、工具声明和断言结果保存在 [对照数据](<pi-prompt-comparison.json>)。这些是静态组装结果，不是抓取的模型提供商请求。

## 具体差异

| 部分 | 原生 Pi | DSH 的 pi 预设 |
| --- | --- | --- |
| 身份 | 运行在 Pi harness 中的编程助手 | 运行在 DeepSeek Harness 中，使用固定 Pi 工具集 |
| 九个工具名和参数 schema | Pi 原版 | **九个均一致** |
| 工具描述 | 原版 loadout 准备后的描述 | **八个一致**；codemode 只改了输入传输说明 |
| codemode 输入说明 | 原始 JavaScript，不是 JSON | JavaScript 放在 JSON 的 `code` 字段中 |
| 工具清单与行为规则 | Pi 按启用工具生成 | 复用相同构建器、片段和指南 |
| codemode 的工具提示 | 直接工具增加脚本调用及返回类型提示；其他工具按披露方式和预算列出 | 复用原版 `prepareLoadout`，不重复塞入全部直接工具声明 |
| Pi 文档导航 | 包含 Pi SDK、扩展、主题、TUI 等文档入口 | 省略这部分，避免把 DSH 定制任务引向 Pi 自身文档 |
| 权限 | Pi 自身环境及扩展决定 | 增加 DSH 权限说明，拒绝后不得绕过，工具不接受提权参数 |
| 模型接口 | 原生 codemode 扩展默认启用 `models.*` | 未启用分类器、图像模型等接口 |
| 项目与运行时信息 | Pi 加载和组织 | DSH 加载和组织，位置及内容不保证相同 |
| MCP | Pi 自己的 MCP 配置、连接及命名空间元数据 | 复用 DSH 已有连接、名称、规范结果和权限；不复制凭据 |

codemode 的唯一必要描述替换是：

```diff
-The input is raw JavaScript (not JSON, no code fence),
+The JSON `code` field contains raw JavaScript (no code fence),
```

保留了原生 codemode 的脚本语义，但没有接入提供商专用的原始代码约束采样传输，不能声称传输层完全相同。

## 静态体积

单位是 **Unicode 字符数，不是 token 数**。正文各段以空行拼接；工具声明按名称排序，使用紧凑 JSON 序列化。

| 对等能力基线 | 原生 Pi | DSH pi |
| --- | ---: | ---: |
| 静态正文 | 2,366 | 1,459 |
| 九个工具声明 | 7,292 | 7,300 |
| 两者合计 | 9,658 | 8,759 |

本基线减少 **899 字符，约 9.3%**。主要原因是去掉 Pi 自身文档导航，再加入较短的 DSH 身份和权限说明。JSON 输入说明让工具声明增加了 8 字符。

原生 codemode 保留默认模型接口时，九个工具声明为 **7,381 字符**。

当前已安装配置还带有 `nowledge_mem` 的命名空间与权限提示，静态正文为 **1,791 字符**。实际 MCP 目录取决于在线工具、披露模式和该会话已加载的工具；默认 codemode MCP 不进入内联目录。本表没有把真实 Nowledge Mem 的完整目录纳入基线。

**不能据此推出实际首轮请求减少 9.3% token。** 完整请求还包括 DSH 运行时上下文、项目规则、技能或记忆注入、会话历史、提供商封装和模型的 schema 转换。本轮没有测量真实提供商 tokenizer 或发送实际模型请求。

## 执行语义与兼容边界

- `read` 和 `bash` 保留 Pi 1.5.0 的结构化脚本返回。文本读取可得到字符串；图片读取可得到可交给 `image()` 的对象；bash 返回包含 `output`、`exit_code` 等字段的对象。
- 非零 bash 退出仍是失败的工具结果，但脚本可读取其结构化值，应检查 `exit_code`。权限拒绝、取消或后置策略改写不会通过这个桥接恢复被拒绝的值。
- MCP 成功结果沿用 DSH 的规范返回。DSH 对 MCP 服务端错误的处理可能不保留原始错误 envelope，因此错误结果与直接用 Pi 不保证一致。
- 原生 Pi 的 MCP 映射把 `codemode` 和 `deferred` **都转成 deferred 工具**。两者起初均不进入公开 schema 或内联目录，但可由脚本发现、调用，也可由 `tool_search` 找到。搜索成功后，从下一次模型调用开始增加公开声明。0.3.0 已修正这个映射；旧报告把 `codemode` 描述为预算内联是不准确的。
- `store/load` 和已加载工具名来自成功提交的会话结果元数据。失败和取消不提交；恢复与分叉根据保留的日志重建；不同会话不共享可变状态。
- 文件写入使用 DSH 的原子发布。目标是符号链接时，DSH 替换链接，不写穿链接。进程环境、错误分类、附件限制和本地权限由 DSH 决定。
- `grep` 的进程驱动做了适配，因为 Pi 没有提供可注入的 spawn 接口；公共定义、路径规则及截断辅助函数仍来自固定版本。`rg` 和 `fd` 需在 DSH 环境中可用，不自动下载。
- `models.*`、PowerShell、任意 Pi 扩展和 Pi 自身 agent loop 未移植。独立嵌套输出不会全部加入模型历史；保留 Pi 的嵌套调用摘要。

## 验证结果

### 0.2.0 基线验证

原先的临时端到端检查覆盖了基础工具、QuickJS 工具调用和隔离、bash 与图片的结构化返回、并发及策略顺序、取消、状态提交与恢复、预设隔离和九个参数 schema。上述字符数仍引用该次采样，不是本轮新测量的模型请求。

### 0.3.0 本轮已验证

- 原生 MCP exposure 映射、无 deferred 内联目录、命名空间别名及 instructions、作用域隔离和元数据移除的临时检查通过。这一检查使用适配器夹具，不代表真实 MCP RPC 已通过。
- DSH 工具 UI 的 22 个现有测试文件、542 项测试通过。插件仓库的 32 项现有测试通过。未新增或修改测试文件。
- 受影响的 DSH 前端包类型检查及 bundle 构建通过。三个 DSH 源文件和 Pi 插件的针对性 lint、包校验及当时的 diff 空白检查通过。
- Plugin Manager 最终返回 `application: applied`，版本为 `dsh-pi-tools@0.3.0`。没有重启服务。移除旧链接时曾返回 `restart-required: unmanaged-plugin`；随后安装成功应用。
- 运行时 Config 已含 `presentationOnly`。Client Inspect 确认 `tool.call.presentation` 已声明，且存在一个 active 注册项。这证明接入已激活，不等于视觉或点击行为已经实测。

后续分阶段检查已补齐真实 Cordis 提示词生命周期：挂载公共 SystemPrompt、Tools 和 Native Executor 后，实际运行 scoped waterfall，验证完整 persona 不被改变、命名空间别名与作用域隔离、instructions 替换、取消不覆盖快照、移除清除旧元数据。验证中使用本地 MCP 夹具，没有调用真实服务器。此前脚本的依赖解析、Context 清理接口和缺少 executor 问题已排除。

原版 QuickJS 与 BM25 的独立发现检查也已通过：`describeNamespace` 能按别名返回完整 instructions，`searchTools` 和 `tool_search` 都能命中仅存在于 namespace instructions 的词，deferred 工具不会进入内联声明。`presentationOnly` 检查使用拒绝任何属性访问的 Host Context，确认该入口不读取 Host 服务。这些仍是本地夹具检查，不代表真实 MCP RPC 或模型调用通过。

同时重新生成了 `tool.call.presentation` 的 Client Inspect 目录，并完成该包类型检查、bundle 构建与 2 项现有 provider 测试。运行时 Inspect 已返回该插槽的 description、select 注册规则和 owner props，而非只有空目录的拓扑节点。生成差异已审阅，目录新鲜度检查与 diff 空白检查通过。

离线包内容检查通过：`npm pack --dry-run --json --ignore-scripts --offline` 共列出 15 个文件，Web companion、Host 实现、bundle patch 和包入口均包含在内，没有 tests 或 node_modules 内容。没有执行生命周期脚本或写出归档。已安装 bundle 的 realpath 与当前工作区源码一致，版本仍为 0.3.0。

诊断入口检查只执行了当前 DSH CLI 的 `--help`。其顶层接口是 profile launcher；另起 headless profile 不能代替现有 GUI 的实测，因此没有启动另一实例、导出配置或读取认证信息。

## 本轮新增的呈现能力

DSH 只新增通用的可选 `tool.call.presentation` chain。Pi 卡片由插件提供，使用原版 edit diff、读取偏移行号、写入内容、codemode 调用摘要及耗时、tool_search 已加载工具名。成功文件操作记录执行时的绝对路径及跳转行号。

只有携带 Pi 1.5.0 元数据的成功纯文本结果匹配新卡片。失败、准备中、含图片或其他预设的调用保留原有呈现。Auto review 拒绝仍由工具树处理。没有增加实时脚本进度，也没有改工具参数。

根级 `presentationOnly` 入口只负责加载 Web companion，不安装 Host 工具、完整提示词、executor 或会话状态。Pi 工具仍在 `pi` 预设内；默认预设没有切换。这个 UI 接口依赖本地 DSH checkout 的配套改动，尚未提交到 Git。

## 剩余验证边界

用户在 2026-11-12 曾选择“先到这里”。后续自动目标轮次的持久状态已恢复为 active，本轮只补做不接管浏览器的本地验证，保留安装和未提交改动。

- 真实模型提供商往返与新 pi 会话中的 Nowledge Mem RPC。
- 成功卡片的展开、文件跳转、亮暗主题、窄屏及长内容的实际视觉表现。
- 远程文件系统与进程后端。

浏览器验证空间 3 曾经用户授权恢复，随后再次报告任务已结束。已停止浏览器控制，没有绕过或自行重新接管，也没有关闭用户空间。后续需要用户明确恢复后，才能继续该空间的实测。

# 插件检查器独立复审

## 结论

四个实现文件的只读复审已完成。**Standards：0 项必须修复问题；Spec：0 项必须修复问题。** 本代理的无写入验证也未发现阻断交付的问题。Lead 已报告实际浏览器中的搜索、组合筛选、空状态、键盘、JSON 下载和注入防护检查通过。浏览器结果明确归属于 Lead，不把本代理静态复审当作浏览器验收。

当前真实仓库扫描为 **11 个插件、0 条 error、1 条 warning**，host 11、web 9、有约定文档页 10、有改动插件 1。唯一 warning 是 `git-changes` 缺约定文档页，属于资料缺口，不是插件运行失败，也不是本次实现的代码审查缺陷。

以上结论仅针对本次读取的实现，不代表插件在 DSH 中运行正常，不构成完整安全审计或运行时兼容性证明。

## 范围与依据

本代理唯一写范围为 [使用说明](../scripts/plugin-inspector/README.md) 和本报告。实现、测试、现有插件、根包配置、锁文件及原有用户改动均不在写范围内。不提交、发布、安装依赖或修改全局配置。

审查依据：

- [模块契约](../scripts/plugin-inspector/contract.md)：静态边界、数据结构、退出码和渲染要求。
- [贡献约定](../CONTRIBUTING.md)：插件布局和既有校验约束。
- [validator](../scripts/validate.mjs)：清单、export、bundle、client、locale 的现有静态检查行为。
- [根包配置](../package.json)：支持 Node.js `^22.19.0 || >=24.0.0` 与既有命令。

实读范围：

| 文件 | 本次读取范围 | 重点 |
| --- | --- | --- |
| [scanner](../scripts/plugin-inspector/scan.mjs#L1-L469) | 全文，469 行 | 发现规则、单包容错、统计、依赖、Git |
| [HTML renderer](../scripts/plugin-inspector/render-html.mjs#L1-L200) | 全文，200 行 | 数据转义、DOM 写入、筛选、键盘、下载、响应式布局 |
| [CLI](../scripts/inspect-plugins.mjs#L1-L88) | 全文，88 行 | 参数、cwd 路径、三种输出、覆盖保护、退出码 |
| [Markdown formatter](../scripts/plugin-inspector/format-markdown.mjs#L1-L98) | 全文，98 行 | 主要章节、静态文案、特殊字符与文件链接 |

本次按 Standards 和 Spec 两个轴分别核对，不再委派子代理。用户指定当前新模块与契约，不是某个固定 commit 的整分支 diff；因此不对原有改动做范围外评价，也不把契约文字本身当成实现证据。

## Standards

没有发现必须修复的规范违反，也未提出缺乏实际需求的抽象或加固改造。

- scanner 仅导入 Node.js 内置模块；renderer 无第三方依赖。
- scanner 使用文件读取和受限 Git 子进程，不导入插件、不执行包脚本。HTML/Markdown renderer 不写文件、不联网。
- CLI 只有在指定 `--output` 时写报告。现有目标使用 `wx` 拒绝覆盖，只有 `--force` 切换为 `w`，见 [CLI 输出逻辑](../scripts/inspect-plugins.mjs#L68-L82)。
- 文档与实际参数保持一致，包含 cwd 默认值、等号形式、`--force` 和 warning 的 strict 语义。
- 本代理未新增或修改测试文件。下列单次核对命令没有向仓库添加验证脚本或测试夹具。

注意：“只读”描述扫描与渲染行为，不是安全隔离沙箱。CLI 会写用户明确指定的输出路径；文档已提醒不要把它指向原始资料，尤其不要误用 `--force`。

## Spec

没有发现必须修复的契约偏差。覆盖情况如下；“源码”不等于已运行所有边界输入。

| 契约项 | 实现证据 | 核对方式 |
| --- | --- | --- |
| 根目录失败可诊断，单包坏数据尽量继续 | [扫描入口](../scripts/plugin-inspector/scan.mjs#L407-L469)、[单包隔离](../scripts/plugin-inspector/scan.mjs#L285-L316) | 源码；本代理实际无效根目录返回 2；Lead 夹具覆盖坏清单 |
| 直接非符号链接目录、id 排序、JSON schema | [扫描入口与汇总](../scripts/plugin-inspector/scan.mjs#L434-L469) | 源码及实际 JSON/排序/计数对账 |
| 条件/数组 export、pattern 未检查、声明能力 | [export 与 client](../scripts/plugin-inspector/scan.mjs#L97-L172) | 源码；Lead 夹具覆盖条件、数组与 pattern |
| 必需资料 error、缺文档 warning、无测试只计库存 | [资料检查](../scripts/plugin-inspector/scan.mjs#L133-L220)、[文件库存](../scripts/plugin-inspector/scan.mjs#L223-L255) | 源码与真实 docs-missing finding |
| 内部包名匹配与四类依赖 | [依赖收集](../scripts/plugin-inspector/scan.mjs#L257-L273)、[依赖图](../scripts/plugin-inspector/scan.mjs#L371-L404) | 源码；Lead 补充输入 |
| Git best effort、info、不计入 error/warning | [Git 快照](../scripts/plugin-inspector/scan.mjs#L319-L369)、[info 与摘要](../scripts/plugin-inspector/scan.mjs#L429-L465) | 源码；非 Git 输入由 Lead 验收 |
| 离线 HTML、嵌入数据安全、无外部资源 | [JSON 转义](../scripts/plugin-inspector/render-html.mjs#L1-L11)、[textContent 写入](../scripts/plugin-inspector/render-html.mjs#L60-L95) | 源码及本代理恶意文本 roundtrip、脚本语法核对 |
| 主要视图、空状态、组合搜索和筛选 | [视图](../scripts/plugin-inspector/render-html.mjs#L30-L49)、[详情与筛选](../scripts/plugin-inspector/render-html.mjs#L116-L173) | 源码与空报告生成；Lead 已报告浏览器交互通过 |
| 键盘、窄屏与 JSON 下载 | [响应式样式](../scripts/plugin-inspector/render-html.mjs#L14-L26)、[交互](../scripts/plugin-inspector/render-html.mjs#L175-L194) | 源码；Lead 实际键盘/下载/390px 窄屏通过，本代理已读取截图 |
| CLI 默认 Markdown，三格式 stdout，stderr 诊断 | [CLI](../scripts/inspect-plugins.mjs#L25-L87) | 三种格式实际调用，不写文件 |
| 退出码 0/1/2、先输出再 finding 失败、拒绝覆盖 | [CLI](../scripts/inspect-plugins.mjs#L68-L87) | 本代理实际调用，详见下节 |
| Markdown 主要信息、路径与字符转义 | [格式化器](../scripts/plugin-inspector/format-markdown.mjs#L4-L98) | 源码、默认输出与特殊字符探针 |

### 本代理独立执行的核对

执行环境为当前仓库与 Node.js v26.12.0。所有核对均在 stdout 或内存完成，不创建测试文件，不写临时夹具，也不对真实资料使用 `--force`。

1. 扫描实际仓库，验证 `schemaVersion: 1`、插件 id 排序、JSON 序列化往返，以及 error/warning 按全部 findings 对账。结果：11 包、0 error、1 warning。
2. JSON 普通模式退出 0；JSON strict 模式退出 1，stdout 仍为完整可解析 JSON，warning 原等级不变。
3. help 退出 0；非法 format 退出 2 且 stdout 为空；不存在的 root 退出 2，stderr 包含具体路径与读取错误。
4. 将已存在的使用说明路径作为输出目标，**不带 `--force`**，确认退出 2、提示换路径或显式 force，文件 SHA-256 前后一致。未执行任何真实文件强制覆盖。
5. 默认命令生成 Markdown stdout，包含总览、插件清单、仓库提示、详情、依赖与工作区六个主要章节。
6. 在内存副本中加入竖线、HTML 标签等特殊字符，确认 Markdown 标签转义、文件 URL 对竖线进行百分号编码，未发现表格链接中的裸竖线问题。
7. 对 HTML 注入包含 `</script><script>…`、HTML 标签、`&`、U+2028/U+2029 的仓库名称、描述和 finding。确认生成内容只有预期的两个 script 块，JSON 数据完整往返，原始危险分隔符被编码，内嵌 JavaScript 可编译，没有外部资源标签。
8. 空插件/空依赖数据可生成完整 HTML；真实 CLI 的 HTML stdout 以 doctype 开始并退出 0。

一次 Markdown 探针错误地假定 URL 中会保留裸竖线，因找不到该行而使探针本身报错。随后的定向检查确认 `pathToFileURL` 已编码为 `%7C`，因此没有把探针失败误记成产品缺陷。

### Lead 提供的独立验收证据

已阅读 [验收记录](plugin-inspector-validation.md)，并收到 Lead 后续的实际浏览器与 full lint 结果。证据归属如下：

- 既有 `pnpm run validate` 通过，17 项既有插件测试通过。这些是额外执行的验收命令，不是 scanner 推断的测试结论。
- CLI 的 18 项临时输入断言通过，覆盖健康、缺文档、坏清单、空仓库、带空格路径、相对输出 cwd、默认拒绝覆盖与显式 force 等。
- 补充输入覆盖内部依赖、peer/optional、数组 exports、符号链接目录、无清单目录和多种非法清单类型。
- 实际浏览器 11 项交互断言通过，包括 finding 大写搜索、search/status/web 组合、空结果、reset、web 9 与 ok 8、error 0、ArrowDown/End，以及 warning 的准确路径。
- 浏览器真实下载事件已触发；Lead 捕获的原始 Blob 内容与内嵌 JSON 完全相同。
- 浏览器中恶意 script-closing、img/onerror 和 Unicode 文本未注入；页面仅有预期的两个 script 块，无外部资源。空仓库与非 Git 的 info/unknown 文案检查通过。
- **全仓库 lint 不通过，退出 1。** Lead 定位到未修改的 [既有 client](../packages/auto-review-model/lib/client.js) 中 onmessage、onerror、reverse 共三项 warning，以及 [既有 host](../packages/auto-review-model/lib/index.js) 中两项 sort warning。`--deny-warnings` 因这五项既有告警失败；不在本任务范围内修复。
- 四个新增模块同批执行 `pnpm exec oxlint --deny-warnings`，结果为 0 warning、0 error；四次 `node --check` 全部通过。Lead 对两个既有告警文件执行 `git diff --exit-code`，确认本任务没有修改它们。
- 390×844 的实际 CDP 窄屏中，`innerWidth === scrollWidth === 390`，toolbar 两列、插件库存单列，没有页面横向溢出。本代理已读取 [全页窄屏截图](<plugin-inspector-mobile.png>)，画面与上述布局描述一致；表格保留容器内横向滚动。Lead 另外确认 1440×1000 桌面的 `scrollWidth` 等于 viewport，并保存 [桌面截图](<plugin-inspector-desktop.png>)；本代理未另行实读桌面图。
- 最终 HTML 与 Markdown 来自同一 JSON 快照，`generatedAt` 为 `2026-11-10T11:44:42.165Z`。Lead 确认所有实现作者已完成，没有后续实现变动。

以上命令与浏览器检查属于 Lead/作者的执行结果，本代理没有重复创建夹具、运行既有测试或进行浏览器操作。不得据此写“全绿”或声称 `pnpm run check` 通过。

## 使用说明交付核对

[中文使用说明](<../scripts/plugin-inspector/README.md>) 已覆盖：全部参数、帮助短别名与等号形式、`--force` 风险、退出码 0/1/2、可执行示例、stdout/stderr 区别、输出路径 cwd、warning/info 解释、三种格式、与 validator 的区别、只读及静态边界。

文档还明确了实现限制：bundle/client 使用静态文本模式，不是完整 YAML/JavaScript 解析；源文件统计按常见目录名排除，不识别所有自定义生成目录；HTML 下载导出当前嵌入快照，不重新扫描仓库。

## 文档格式与原有改动保护

本代理已核对两份交付文档的末尾换行、尾随空格、代码围栏配对和本地链接，均通过；`git diff --check` 通过。读取当前 tracked diff 得到 SHA-256 `9a82d4f286bb978574549feb88b9a740d42f5e28335bce1097fb607620ff2e90`，与 Lead 的原有改动基线相同。原有未跟踪的 agent-team 包和文档不在本代理写范围内。

## 尚未验证与残余边界

- 本代理未亲自进行浏览器实测。浏览器交互、下载及 CDP 数值归属于 Lead 的执行证据；本代理另外读取了窄屏截图。
- Git 路径的 NUL、空格、rename 处理已读源码，未由本代理新建真实 Git 仓库覆盖所有状态。
- 本代理未在 Node.js 22/24 分别运行，没有遍历每种权限故障、并发文件删除、符号链接或超大仓库输入。
- 静态 export、locale、bundle 文本检查不替代运行、完整语法解析、漏洞扫描或实际安装验证。
- 未声称所有边界均已覆盖，也未声称“没有发现”意味着不存在缺陷。

最终复审已完成，没有待审实现或未处置的代码审查发现。上述未验证边界予以保留，不扩大静态工具的质量声明。全仓库 lint 的既有告警也未被局部模块通过结果掩盖。

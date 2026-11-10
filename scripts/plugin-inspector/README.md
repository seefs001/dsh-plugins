# 插件仓库静态检查器

从仓库已有文件生成插件清单、静态发现和依赖概览，输出 Markdown、JSON 或可离线打开的 HTML。工具只读取插件资料，不导入或运行插件，不安装依赖，不执行包脚本，也不访问网络。只有显式指定输出文件时，CLI 才会写入报告。

本工具补充现有 [validator](../validate.mjs)，不替代它。接口与检查规则见 [模块契约](./contract.md)。

## 运行要求

- 使用仓库支持的 Node.js：`^22.19.0 || >=24.0.0`。
- 不需要为检查器安装第三方依赖，也不需要先构建插件。
- 扫描根目录下需要有可读取的 `packages/` 目录。
- Git 可选。没有 Git、没有 Git 仓库或无法读取 Git 信息时，插件文件扫描仍可使用；不要把缺少 Git 信息理解成工作区干净。

下列命令均从仓库根目录运行。

## 快速开始

```bash
# 默认输出 Markdown 到 stdout
node scripts/inspect-plugins.mjs

# 查看参数帮助，不扫描仓库
node scripts/inspect-plugins.mjs --help

# JSON 输出到 stdout，可交给其他工具处理
node scripts/inspect-plugins.mjs --format json

# HTML 写到仓库外，随后直接用浏览器离线打开
node scripts/inspect-plugins.mjs --format html --output /tmp/dsh-plugins-inspector.html

# 显式允许替换已有报告
node scripts/inspect-plugins.mjs --format html --output /tmp/dsh-plugins-inspector.html --force

# 扫描另一份仓库，输出路径仍相对于当前调用目录
node scripts/inspect-plugins.mjs --root /path/to/other-checkout --format markdown --output ./other-inspection.md

# CI 中将 warning 也视为失败；即使退出 1，仍会先生成报告
node scripts/inspect-plugins.mjs --strict --format json --output /tmp/dsh-plugins-ci.json --force

# 原有校验仍独立执行
pnpm run validate
```

首次使用 `--output` 时若目标已存在，工具会拒绝覆盖。可换一个文件名，或确认目标后加 `--force`。不要把输出指向清单、源码或其他需保留的原文件；`--force` 会按指定目标覆盖。标准输出重定向由 shell 处理，`>` 可能直接覆盖目标，不受 CLI 的保护；需要保护文件时请用 `--output`。

## CLI 参数

```text
node scripts/inspect-plugins.mjs [--root DIR] [--format html|json|markdown] [--output FILE] [--force] [--strict] [--help]
```

| 参数 | 默认值与行为 |
| --- | --- |
| `--root DIR` | 选择扫描根目录；省略时扫描当前工作目录。相对路径按调用者当前目录解析。 |
| `--format html\|json\|markdown` | 选择输出格式，默认为 `markdown`。不通过输出文件扩展名推断格式。 |
| `--output FILE` | 把报告写入指定文件。路径按调用者当前目录解析，不按 `--root` 解析。省略时，三种格式都写到 stdout。 |
| `--force` | 允许替换已存在的输出文件。不改变发现等级、退出码或扫描边界。 |
| `--strict` | warning 也触发退出码 1，原发现等级不变。 |
| `--help`、`-h` | 显示用法并以退出码 0 结束。 |

三个带值的参数也支持等号形式：`--root=DIR`、`--format=json`、`--output=FILE`。

诊断信息写到 stderr，报告写到 stdout 或 `--output` 指定的文件。自动化时应分别处理这两条流，不要把 stderr 合并进 JSON。

### 退出码

| 退出码 | 含义 | 是否有报告 |
| --- | --- | --- |
| `0` | 扫描成功，无 error；未启用 `--strict` 时允许有 warning。`--help` 也返回 0。 | 正常扫描会生成；帮助不生成。 |
| `1` | 扫描成功，但发现 error；或启用 `--strict` 且发现 warning。 | 会先生成完整报告，再返回 1。 |
| `2` | 参数不合法、扫描根目录不可用、扫描失败或输出写入失败，例如拒绝覆盖已有文件。 | 不保证产生完整报告，先读 stderr。 |

退出码 `0` 不代表插件能运行、通过测试或可安全安装。退出码 `1` 是资料检查结果，不等于检查器崩溃。退出码 `2` 应先处理执行问题，再解释报告内容。

## 扫描内容

检查器将 `packages/` 下每个非符号链接的直接子目录视为候选，只收录含清单文件的插件。清单 JSON 无效时，仍保留插件条目并记录 error，继续检查其他插件。插件按目录 id 排序。

报告包括：

- 仓库名称、扫描时间、根目录，以及尽力获取的 Git 分支、短提交号和变更路径。
- 包名、版本、描述、Node/DSH 引擎范围、host/web 声明。
- export 目标、语言元数据、README/图标/bundle/约定文档页的存在情况。
- JS/TS 源文件数量和字节数，已有 test/spec 文件数量。
- 内部依赖边及外部依赖清单，区分 `dependency`、`dev`、`peer`、`optional`。
- 每项发现的等级、稳定 code、说明和相关路径。

`host` 表示声明了主导出 `.`，`web` 表示声明了 `dsh.client`。这些是声明清单，不是插件已加载或浏览器功能已通过检查的证据。

export 条目会展开条件和数组目标。工具只检查字面量本地目标；含通配符的目标仅列入清单，`exists: null` 表示没有执行存在性判断，不等于目标不存在。

源文件统计按内置的常见目录名排除依赖目录、Git 元数据、生成产物和测试目录，不会识别所有自定义生成路径。测试数量只表示发现了已有文件，不执行也不修改它们。没有测试文件本身不产生 warning。bundle patch 与 client bundle id 使用静态文本模式检查，不是完整 YAML 或 JavaScript 解析。

## 如何解释发现与 warning

插件状态按最高等级确定：有 error 为 `error`，否则有 warning 为 `warning`，否则为 `ok`。摘要的 error/warning 数量统计的是**发现条数**，包含仓库级发现，不是有问题的插件数量。

- **error**：必需字段缺失、必需资料不存在、字面量 export 损坏或数据格式错误等。先根据 code、message 与 path 定位，再用 validator 和必要的运行验证确认修复效果。
- **warning**：需要人工判断的静态提醒，不是已证实的运行故障。例如缺少约定文档页会产生 warning。默认保留报告且不因此返回 1；需要阻止这类结果时加 `--strict`。
- **ok**：当前扫描范围内没有发现 error/warning，不代表运行兼容性、功能正确性或安全审计通过。

遇到 warning，先读具体说明与路径，判断是资料缺口还是已知约定差异。存在文档页只说明约定路径上有文件，不证明网页已发布、内容完整或与实现同步。不要仅为让摘要变绿而把 warning 当成 error 处理，也不要忽略它所指向的缺口。

Git 不可用时，仓库级发现使用 `severity: 'info'`、`code: 'git-unavailable'`，分支和提交为 `null`。info 是背景信息，不计入 error/warning 摘要，也不会单独使 `--strict` 失败。未跟踪文件和带空格的路径也应包含在可用的 Git 变更清单里。工作区变更只代表路径状态，不是代码行为差异分析。

## 三种报告格式

### Markdown

适合终端、代码审查记录和人工阅读。默认输出到 stdout；需要保留时用 `--output`。关注发现的具体路径，而不只是摘要计数。

### JSON

提供 `schemaVersion: 1` 的结构化快照，包括 `repository`、`summary`、`plugins`、`dependencies` 和仓库级 `findings`。插件级发现位于各自的 `findings`。`generatedAt` 为扫描生成时间，`root` 为扫描根目录绝对路径。

自动化消费时应检查退出码，区分 `null` 与空数组，并同时处理插件级和仓库级发现。计数、文件存在性和能力声明仍是静态数据。

### HTML

生成单个独立 HTML 文件，直接在浏览器中打开即可使用，不需要启动服务。页面包含摘要、插件搜索、状态与能力组合筛选、插件详情、发现路径、依赖清单和 JSON 下载。搜索覆盖 id、包名、描述与发现文本。

报告不依赖第三方字体或脚本，不发送遥测或网络请求。页面中的下载导出已嵌入的快照，不会重新扫描仓库。报告包含仓库路径、依赖和工作区状态，分享前应检查是否有不适合公开的信息。

## 与 validator 的区别

| 项目 | 本检查器 | 原有 validator |
| --- | --- | --- |
| 主要用途 | 仓库盘点、静态发现与可共享报告 | 执行既有插件结构约束 |
| 输出 | Markdown、JSON、离线 HTML，含 warning 和依赖清单 | 终端通过消息或错误列表 |
| 仓库选择 | 可用 `--root` 指定 | 基于脚本所在仓库定位 |
| 字段、导出、locale、bundle | 根据检查器契约检查，并解释静态边界 | 按既有脚本规则核对，含 bundle 插入名称、client bundle id、locale 元数据一致性等 |
| 坏的单包清单 | 记录 error，尽量继续其他插件 | 直接解析清单，不能据此假定与检查器拥有相同的容错方式 |
| 文档、变更与依赖 | 提供约定文档页、Git 变更和内部/外部依赖盘点 | 不提供这些报告视图 |
| 测试与运行验证 | 不执行 | validator 本身也只做静态检查；仓库 `check` 还会单独运行 lint 和测试 |

两者通过并不互相蕴含。发布、安装或运行兼容性判断仍需原有校验与对应验证，不能用一份静态报告替代。

## 只读与静态边界

- scanner 与 HTML/Markdown renderer 不写扫描目录；CLI 只写用户明确指定的报告文件。将报告放到扫描仓库外，可避免报告自身成为后续扫描的工作区变更。
- 不导入插件、不执行 host/web 入口、不运行测试或包脚本、不构建、不安装、不发布，不修改清单、源码、锁文件或全局配置。
- 不解析运行时完整依赖图，不查询 registry，不验证下载可用性或实际安装后的模块解析。
- 不做漏洞检测、恶意代码审计、许可合规审计或运行时兼容性证明。
- 文件存在不等于内容正确；声明了引擎范围不等于当前主机满足它；有测试文件不等于测试通过。
- 扫描是某一时刻的快照，不是仓库锁定或一致性事务。扫描期间有并行改动时，结果可能反映不同读取时点；需要稳定记录时，在没有并行写入的工作区重新生成。
- 只读不代表不会读取敏感资料。仓库内的清单、路径及 Git 状态会进入报告，分享前自行审查。

## 常见问题

**为什么生成了报告，命令仍然返回 1？**

这是发现驱动的退出码。打开报告查看 error；若启用了 `--strict`，还要查看 warning。

**为什么 JSON 文件没有生成？**

先看退出码与 stderr。目标存在且未加 `--force`、目标目录不可写或扫描根目录错误，都可能返回 2。

**HTML 可以离线使用吗？**

可以。生成后不需要 Node.js、DSH 或本地 Web 服务；所有交互使用报告中嵌入的数据。它不会自动反映文件后续变化，需要重新运行 CLI。

**能否据此安装或启用插件？**

不能。报告没有执行插件或模拟 DSH。保留既有 validator、lint、测试及适用的实际运行验证。

**文件数量或文档数量为什么与人工预期不同？**

先核对扫描根目录、排除目录和约定文档路径。统计是规则下的清单，不是测试覆盖率或文档质量评分。

# 插件仓库静态检查器

根据仓库里已有的文件生成插件清单、静态检查结果和依赖概览，输出 Markdown、JSON 或可以离线打开的 HTML。它只读取插件资料，不导入或运行插件，不安装依赖，不执行包脚本，也不访问网络。只有指定了输出文件时，CLI 才会写入报告。

它是现有 [validator](../validate.mjs) 的补充，不能替代它。接口和检查规则见 [模块契约](./contract.md)。

## 运行要求

- 仓库支持的 Node.js：`^22.19.0 || >=24.0.0`。
- 不需要安装第三方依赖，也不需要先构建插件。
- 扫描根目录下要有可读的 `packages/` 目录。
- Git 可选。没有 Git、不是 Git 仓库或读不到 Git 信息时，插件文件照常扫描；缺少 Git 信息不代表工作区是干净的。

以下命令都在仓库根目录运行。

## 快速开始

```bash
# 默认输出 Markdown 到 stdout
node scripts/inspect-plugins.mjs

# 查看参数帮助，不扫描仓库
node scripts/inspect-plugins.mjs --help

# JSON 输出到 stdout，交给其他工具处理
node scripts/inspect-plugins.mjs --format json

# HTML 写到仓库外，再用浏览器离线打开
node scripts/inspect-plugins.mjs --format html --output /tmp/dsh-plugins-inspector.html

# 允许替换已有的报告
node scripts/inspect-plugins.mjs --format html --output /tmp/dsh-plugins-inspector.html --force

# 扫描另一个仓库，输出路径仍相对于当前目录
node scripts/inspect-plugins.mjs --root /path/to/other-checkout --format markdown --output ./other-inspection.md

# CI 里把 warning 也当作失败；退出码为 1 时报告仍会先生成
node scripts/inspect-plugins.mjs --strict --format json --output /tmp/dsh-plugins-ci.json --force

# 原有校验照常单独运行
pnpm run validate
```

`--output` 指向已存在的文件时，工具拒绝覆盖。换一个文件名，或确认目标无误后加 `--force`。不要把输出指向清单、源码或其他要保留的文件，`--force` 会直接覆盖。用 `>` 重定向 stdout 由 shell 处理，会直接覆盖目标，不受 CLI 保护；需要这层保护时用 `--output`。

## CLI 参数

```text
node scripts/inspect-plugins.mjs [--root DIR] [--format html|json|markdown] [--output FILE] [--force] [--strict] [--help]
```

| 参数 | 默认值与行为 |
| --- | --- |
| `--root DIR` | 扫描根目录，省略时扫描当前工作目录。相对路径按当前目录解析。 |
| `--format html\|json\|markdown` | 输出格式，默认 `markdown`。不会根据输出文件的扩展名推断格式。 |
| `--output FILE` | 把报告写入指定文件。路径按当前目录解析，不按 `--root`。省略时三种格式都写到 stdout。 |
| `--force` | 允许替换已存在的输出文件，不影响发现等级、退出码或扫描范围。 |
| `--strict` | 有 warning 时也返回退出码 1，发现本身的等级不变。 |
| `--help`、`-h` | 显示用法，退出码为 0。 |

三个带值的参数也可以写成等号形式：`--root=DIR`、`--format=json`、`--output=FILE`。

诊断信息写到 stderr，报告写到 stdout 或 `--output` 指定的文件。自动化时分开处理这两条流，不要把 stderr 混进 JSON。

### 退出码

| 退出码 | 含义 | 是否有报告 |
| --- | --- | --- |
| `0` | 扫描成功，没有 error；不加 `--strict` 时可以有 warning。`--help` 也返回 0。 | 正常扫描会生成；`--help` 不生成。 |
| `1` | 扫描成功但有 error，或加了 `--strict` 且有 warning。 | 先生成完整报告，再返回 1。 |
| `2` | 参数不合法、扫描根目录不可用、扫描失败，或写入失败（例如拒绝覆盖已有文件）。 | 不保证有完整报告，先看 stderr。 |

退出码 `0` 不代表插件能运行、测试通过或可以放心安装。退出码 `1` 是资料检查的结论，检查器本身没有出错。退出码 `2` 时先解决执行问题，再看报告内容。

## 扫描内容

`packages/` 下每个不是符号链接的直接子目录都是候选，只收录有 `package.json` 的目录。`package.json` 不是合法 JSON 时，仍保留这个插件条目并记一条 error，其他插件照常检查。插件按目录 id 排序。

报告包括：

- 仓库名称、扫描时间、根目录，以及能取到的 Git 分支、短提交号和变更路径。
- 包名、版本、描述、Node/DSH 引擎范围、host/web 声明。
- export 目标、locale 元数据，以及 README、图标、bundle 和约定文档页是否存在。
- JS/TS 源文件的数量和字节数，已有 test/spec 文件的数量。
- 插件之间的依赖和外部依赖清单，区分 `dependency`、`dev`、`peer`、`optional`。
- 每条发现的等级、固定的 code、说明和相关路径。

`host` 表示声明了主导出 `.`，`web` 表示声明了 `dsh.client`。这些只是声明，不能证明插件已经加载，也不能证明浏览器功能正常。

export 条目会展开条件导出和数组目标。工具只检查字面量的本地目标；带通配符的目标只列出来，`exists: null` 表示没有检查存在性，不代表目标不存在。

源文件统计按内置的常见目录名跳过依赖、Git 元数据、构建产物和测试目录，自定义的生成目录不一定能识别。测试数量只说明找到了这些文件，工具不会运行或修改它们。没有测试文件不会产生 warning。bundle patch 和 client bundle id 用文本模式匹配，不是完整的 YAML 或 JavaScript 解析。

## 如何解释发现与 warning

插件状态取最高等级：有 error 为 `error`，否则有 warning 为 `warning`，都没有为 `ok`。摘要里的 error 和 warning 数量统计的是发现的条数，包括仓库级发现，不是出问题的插件个数。

- `error`：缺少必需字段或必需文件、字面量 export 指向不存在的文件、数据格式错误等。先按 code、message 和 path 定位，修好后用 validator 和必要的运行检查确认。
- `warning`：需要人工判断的静态提醒，不是已经证实的运行故障，例如缺少约定的文档页。默认不会因此返回 1；需要拦下这类结果时加 `--strict`。
- `ok`：这次扫描范围内没有 error 和 warning。它不代表运行兼容、功能正确或通过了安全审计。

遇到 warning，先读说明和路径，判断是资料缺失还是已知的约定差异。文档页存在只说明约定路径上有文件，不能证明页面已发布、内容完整或与实现一致。不要为了让摘要变绿而把 warning 当成 error 处理，也不要忽略它指出的缺口。

Git 不可用时，仓库级发现为 `severity: 'info'`、`code: 'git-unavailable'`，分支和提交为 `null`。info 只是背景信息，不计入 error 和 warning 的数量，也不会让 `--strict` 失败。Git 可用时，变更清单包括未跟踪的文件和带空格的路径。工作区变更只反映路径状态，不分析代码行为的差异。

## 三种报告格式

### Markdown

适合终端、代码审查记录和人工阅读。默认输出到 stdout，需要保留时用 `--output`。阅读时看每条发现的具体路径，不要只看摘要数字。

### JSON

`schemaVersion: 1` 的结构化快照，包括 `repository`、`summary`、`plugins`、`dependencies` 和仓库级的 `findings`。插件级的发现在各插件自己的 `findings` 里。`generatedAt` 是扫描时间，`root` 是扫描根目录的绝对路径。

自动化处理时要检查退出码，区分 `null` 和空数组，并同时处理插件级和仓库级的发现。计数、文件是否存在和能力声明都是静态数据。

### HTML

生成一个独立的 HTML 文件，用浏览器直接打开即可，不需要启动服务。页面有摘要、插件搜索、可组合的状态和能力筛选、插件详情、发现的路径、依赖清单和 JSON 下载。搜索范围包括 id、包名、描述和发现的文字。

报告不依赖第三方字体或脚本，不发送遥测或任何网络请求。页面上的下载导出的是嵌入的快照，不会重新扫描仓库。报告里有仓库路径、依赖和工作区状态，分享前检查有没有不适合公开的信息。

## 与 validator 的区别

| 项目 | 本检查器 | 原有 validator |
| --- | --- | --- |
| 主要用途 | 盘点仓库，给出静态发现和可分享的报告 | 执行已有的插件结构约束 |
| 输出 | Markdown、JSON、离线 HTML，含 warning 和依赖清单 | 终端通过消息或错误列表 |
| 仓库选择 | 可用 `--root` 指定 | 基于脚本所在仓库定位 |
| 字段、导出、locale、bundle | 按检查器契约检查，并说明静态检查的边界 | 按脚本里的规则核对，包括 bundle 插入的名称、client bundle id、locale 元数据是否一致等 |
| 某个包的 `package.json` 损坏 | 记一条 error，继续检查其他插件 | 直接解析，不要假定它和检查器一样容错 |
| 文档、变更与依赖 | 列出约定文档页、Git 变更和内外部依赖 | 不提供这些内容 |
| 测试与运行验证 | 不执行 | validator 也只做静态检查；仓库的 `check` 另外运行 lint 和测试 |

一个通过不代表另一个也会通过。发布、安装或判断运行兼容性，仍然要靠原有的校验和相应的验证，一份静态报告代替不了。

## 只读与静态边界

- scanner 和 HTML/Markdown renderer 不写入被扫描的目录，CLI 只写你指定的报告文件。把报告放在被扫描的仓库外，报告本身就不会出现在下次扫描的工作区变更里。
- 不导入插件，不执行 Host 或 Web 入口，不运行测试或包脚本，不构建、不安装、不发布，不修改清单、源码、锁文件或全局配置。
- 不解析运行时的完整依赖图，不查询 registry，不检查包能否下载，也不检查安装后模块能否解析。
- 不做漏洞检测、恶意代码审计、许可合规审计或运行时兼容性证明。
- 文件存在不等于内容正确；声明了引擎范围不等于当前主机满足它；有测试文件不等于测试通过。
- 扫描是某一时刻的快照，不会锁定仓库，也不保证一致性。扫描期间有别的改动时，结果可能混合了不同时刻读到的内容；需要稳定的记录时，在没有并行写入的工作区重新生成。
- 只读不等于不读敏感资料。仓库里的清单、路径和 Git 状态都会写进报告，分享前请自行检查。

## 常见问题

### 为什么生成了报告，命令仍然返回 1？

退出码由发现决定。打开报告看 error；加了 `--strict` 时还要看 warning。

### 为什么 JSON 文件没有生成？

先看退出码和 stderr。目标已存在又没加 `--force`、目标目录不可写，或扫描根目录不对，都可能返回 2。

### HTML 可以离线使用吗？

可以。打开时不需要 Node.js、DSH 或本地 Web 服务，所有交互都用报告里嵌入的数据。文件后来的变化不会自动反映出来，需要重新运行 CLI。

### 能否据此安装或启用插件？

不能。生成报告时没有运行插件，也没有模拟 DSH。仍然需要 validator、lint、测试，以及适用的实际运行检查。

### 文件数量或文档数量为什么与人工预期不同？

先核对扫描根目录、被跳过的目录和约定的文档路径。这些数字是按规则统计的清单，不是测试覆盖率，也不是文档质量评分。

# 插件检查器验收记录

当前状态：实现、浏览器验收与独立复审已完成。最终 HTML、JSON、Markdown 共用 `2026-11-10T11:44:42.165Z` 这一扫描快照。全仓库 lint 有既有警告，详见下表；不能称为全仓库 check 通过。

## 真实仓库结果

通过 CLI 扫描当前工作区，结果为 11 个插件、0 条 error、1 条 warning；host 11、web 9、有约定文档页 10。唯一 warning 是 `git-changes` 缺少约定文档页。这不是插件运行故障。

本工具不加载插件、不执行包脚本、不安装依赖、不运行测试。以下测试结果来自本次验收单独执行的仓库既有命令，不是扫描器根据文件存在性推断出来的。

## 已完成检查

| 检查 | 方法 | 结果 |
| --- | --- | --- |
| 既有 manifest 校验 | `pnpm run validate` | 通过，all packages valid |
| 既有插件测试 | `pnpm run test` | 17 项通过，0 失败 |
| 本次四个实现模块 lint | Lead 同批执行 `pnpm exec oxlint --deny-warnings` | 0 warning、0 error |
| 本次四个实现模块语法 | Lead 分别执行 `node --check` | 全部通过 |
| 全仓库 lint | `pnpm run lint` | 退出 1：原有 auto-review-model 两文件共 5 warning，0 error；不在本任务修复范围 |
| 既有 warning 文件未改 | `git diff --exit-code -- packages/auto-review-model/lib/client.js packages/auto-review-model/lib/index.js` | 通过，与 HEAD 相同 |
| 受控 diff 格式 | `git diff --check` | 通过 |
| 真实扫描 JSON | CLI 输出 JSON，独立审查者对账发现数量与排序 | 11 包，0 error，1 warning |
| CLI 正常与异常路径 | 临时目录内真实 CLI 子进程，18 项断言 | 全部通过 |
| 依赖和发现补充检查 | 额外临时仓库内真实 CLI 调用 | 通过，详见下文 |

### 18 项 CLI 端到端检查

使用健康、缺文档、坏清单、空仓库四种临时输入。根目录和输出文件名包含空格；健康插件入口会直接抛异常，以确认检查器没有执行插件代码。

1. 健康输入退出 0。
2. 健康摘要为 1 包、0 error、0 warning。
3. 条件 exports 展开为两个存在的本地目标。
4. 通配符 export 仅列清单，`exists: null`。
5. 非 Git 根目录 branch/head 为 null。
6. 源文件与测试存量计数符合输入。
7. 缺文档默认退出 0，保留 warning。
8. strict 模式退出 1，仍输出完整报告。
9. 坏清单不阻断同级插件，发现两个包。
10. 坏 JSON 有 `manifest-json` finding。
11. 缺失 export 有 `export-missing` finding。
12. 空 packages 目录返回 0 包，不崩溃。
13. 显式文件输出时 stdout 为空。
14. 相对输出路径按调用 cwd，而非扫描根目录解析。
15. 已存在输出默认退出 2，原字节未改变。
16. 显式 `--force` 可替换输出。
17. 不存在的根目录退出 2，带可操作诊断。
18. 缺少 packages 目录退出 2，带可操作诊断。

另外检查 help 退出 0、非法 format 退出 2；Lead 和独立审查者均完成只读核对。Git 不可用产生 `info / git-unavailable`，不计入 error/warning。

### 补充输入

- 内部依赖按包名匹配到插件 id，保留 workspace range。
- 外部 peer 和 optional 依赖保留种类与使用者。
- 数组 fallback exports 展开。
- 指向另一个包的符号链接目录和没有清单的目录不被当成插件。
- `null`、数组和字段类型错误三种清单均产生 findings，其他包继续扫描，没有落入 catch-all 失败。

临时输入位于系统临时目录，未向项目添加或修改单元测试、集成测试文件。

## HTML 和浏览器验收

HTML 作者和独立审查者分别对真实快照、空报告和恶意字符做内存检查：两段 script、JSON 完整 roundtrip、生成 JS 可解析、render 不改输入且相同输入输出相同。页面不引用外部脚本、样式、图片或 frame。

Lead 使用 Ego Browser 的同一个 TaskSpace，通过 `file://` 直接打开报告，没有运行或替换任何服务器。实际浏览器完成 11 项交互断言：

1. 初始显示全部 11 个插件。
2. 大写 `DOCS-MISSING` 搜索命中 git-changes，证明 finding 搜索不区分大小写。
3. 搜索、warning、web 三条件组合仍为 1 个。
4. 改为未声明能力后为 0 个，展示空状态。
5. reset 恢复 11 个。
6. web 筛选为 9 个。
7. web 与 ok 组合为 8 个。
8. web 与 error 组合为 0 个，详情同步空状态。
9. ArrowDown 切换到下一个插件。
10. End 切换到最后一个插件。
11. warning 详情展示缺失文档的准确路径。

此外，点击真实下载按钮触发浏览器 download 事件，并读取该处理器生成的原 Blob，JSON 内容与嵌入报告完全一致。未读取浏览器另存副本的落盘字节，不把事件结果扩大为该副本文件系统审计。

恶意输入包含关闭 script 标签、img/onerror、引号、反斜杠、HTML 元字符及 Unicode 行分隔符。浏览器中无注入标志、无插入 img、仍只有两个 script，详情保留原始字面文本。空仓库中，插件/依赖空状态、`git-unavailable` 信息与“未确认工作区状态”均正确显示。

最终报告在 1440×1000 桌面和 390×844 窄屏下实测，`scrollWidth` 均不超过 `innerWidth`；窄屏筛选双列、库存单列，宽表保留自身横向滚动。两张截图已读取确认：

- [桌面截图](<plugin-inspector-desktop.png>)
- [窄屏完整截图](<plugin-inspector-mobile.png>)

### 全仓库 lint 的既有问题

以下五项 warning 在本次未修改的源码中，`--deny-warnings` 使全仓库 lint 退出 1：

- [auto-review-model client:271](<../packages/auto-review-model/lib/client.js#L271>)：`onmessage` 赋值。
- [auto-review-model client:277](<../packages/auto-review-model/lib/client.js#L277>)：`onerror` 赋值。
- [auto-review-model client:403](<../packages/auto-review-model/lib/client.js#L403>)：`reverse()`。
- [auto-review-model host:150](<../packages/auto-review-model/lib/index.js#L150>)：`sort()`。
- [auto-review-model host:273](<../packages/auto-review-model/lib/index.js#L273>)：`sort()`。

本任务未为了让全仓库 lint 变绿而修改别的插件，也未执行或声称 `pnpm run check` 整体通过。

## 边界

以上检查不证明插件在 DSH 中运行正常，不构成运行时兼容性、漏洞或完整安全审计。Git 空格/rename 的解析规则经过源码复审，未在真实新建 Git 仓库中构造所有状态。源文件统计只覆盖约定目录，依赖清单只覆盖清单声明。

最终独立复审见 [复审报告](<plugin-inspector-review.md>)；模块行为与命令见 [使用说明](<../scripts/plugin-inspector/README.md>)。

## 原有改动基线

在本任务未修改任何既有受控文件后记录的 tracked diff SHA-256：

```text
9a82d4f286bb978574549feb88b9a740d42f5e28335bce1097fb607620ff2e90
```

最终交付前已重新计算并比较，完全一致。原有未跟踪 agent-team 包与文档不在本任务写范围内，团队没有写入；它们未纳入上述 tracked diff 哈希，不能用该哈希证明未跟踪文件的字节历史。

没有安装依赖、提交 Git、发布或部署，没有修改原 DSH GUI。交付的是独立的离线报告与本地 CLI。

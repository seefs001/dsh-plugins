# dsh-diagram-preview

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Web 对话中，将回复完成后的 Mermaid、Graphviz、ECharts 和 SVG 代码块就地渲染为图表。每张图提供 **预览 / 代码** 切换、**小图 / 中图 / 大图** 尺寸选项、快捷 **SVG** 下载，以及最高 400% 的大图缩放弹窗（支持 **复制 PNG**、**下载 PNG** 与 **下载 SVG**）；语法无效时显示错误并保留原代码。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/diagram-preview"
```

## 支持的代码块标签

| 代码块标签 | 内容 |
| --- | --- |
| `mermaid`、`mmd` | Mermaid 图表（流程图、时序图、ER 图、甘特图等） |
| `dot`、`graphviz` | Graphviz DOT 图 |
| `echarts` | JSON 格式的 ECharts option（不支持 JS 代码片段） |
| `svg` | 带 SVG 命名空间的独立 SVG 图像 |

渲染库随插件打包并在浏览器沙箱中按需本地加载，图表以静态图像呈现（不执行脚本，不支持交互控件与外链资源）。未标记的代码块、普通 JSON、数学公式与其他语言保持原样。

## 渲染器构建

`lib/client.{mermaid,graphviz,echarts}.js` 由固定版本的上游浏览器包生成，更新依赖版本后可在仓库根目录运行：

```bash
pnpm --filter dsh-diagram-preview build
```

第三方许可证见 `lib/licenses/`，详细文档见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/diagram-preview)。

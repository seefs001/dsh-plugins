# dsh-plugins 文档站

使用 Fumadocs、Next.js 与 Tailwind CSS 构建，静态导出后部署到 GitHub Pages。

## 本地运行

在仓库根目录执行：

```bash
pnpm install
pnpm run docs:dev        # http://localhost:3000
pnpm run docs:typecheck
pnpm run docs:build      # 输出到 apps/docs/out
```

| 路径 | 说明 |
| --- | --- |
| `content/docs/**/*.mdx` | 文档正文 |
| `content/docs/**/meta.json` | 侧栏分组与排序 |
| `lib/plugins.ts` | 插件分类、简介、运行位置与依赖；包名和标题在构建时从 `packages/*` 读取 |
| `components/plugins.tsx` | 信息框、目录、依赖表和安装命令组件 |
| `app/page.tsx`、`app/global.css` | 首页与样式 |

搜索索引在构建时静态生成（`search-index.json`），在浏览器本地检索。

## GitHub Pages

1. 在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
2. 推送改动到 `main`，或手动运行 **Documentation** 工作流。
3. 部署后访问 <https://seefs001.github.io/dsh-plugins/>。

GitHub Pages 子路径构建命令：

```bash
NEXT_PUBLIC_BASE_PATH=/dsh-plugins pnpm run docs:build
```

改用自定义根域名时，移除工作流中的 `NEXT_PUBLIC_BASE_PATH` 重新构建即可。

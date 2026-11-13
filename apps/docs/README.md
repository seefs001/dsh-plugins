# dsh-plugins 文档站

用 Fumadocs、Next.js 和 Tailwind CSS 构建，静态导出后部署到 GitHub Pages。站点与 `packages/*` 插件分开，不进入任何插件的 npm 包。

## 本地运行

在仓库根目录执行：

```bash
pnpm install
pnpm run docs:dev        # http://localhost:3000
pnpm run docs:typecheck
pnpm run docs:build      # 输出到 apps/docs/out
```

| 位置 | 内容 |
| --- | --- |
| `content/docs/**/*.mdx` | 页面正文 |
| `content/docs/**/meta.json` | 侧边栏顺序和分组 |
| `lib/plugins.ts` | 插件的分组、简介、运行位置和额外要求；版本、DSH 范围和标题在构建时从 `packages/*/package.json` 与 `locale/zh.json` 读取 |
| `components/plugins.tsx` | 插件信息框、目录、版本表和安装命令 |
| `app/page.tsx`、`app/global.css` | 首页和站点样式 |

不需要外部字体、搜索服务或部署密钥。搜索索引在构建时生成，在浏览器本地查询。

## GitHub Pages

1. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
2. 把改动合入 `main`，或在 `main` 上手动运行 **Documentation** 工作流。
3. 部署成功后访问 <https://seefs001.github.io/dsh-plugins/>。

PR 只做类型检查和静态构建，只有 `main` 的部署 job 有 Pages 写入和 OIDC 权限，不需要 `gh-pages` 分支。插件的 `package.json` 或 locale 变化也会触发构建，因为站点从它们读取版本信息。

工作流按仓库名设置 `NEXT_PUBLIC_BASE_PATH=/dsh-plugins`，本地开发默认在根路径。模拟 Pages 构建：

```bash
NEXT_PUBLIC_BASE_PATH=/dsh-plugins pnpm run docs:build
```

预览构建产物时，把 `apps/docs/out` 挂在 `/dsh-plugins/` 下。首页、导航、资源、favicon 和搜索索引都需要这个前缀。`/dsh-plugins/search-index.json` 是构建时输出的静态文件，不需要后端。

改成在域名根路径部署时，从工作流里去掉 `NEXT_PUBLIC_BASE_PATH` 重新构建，再在 Pages 设置里配置域名。

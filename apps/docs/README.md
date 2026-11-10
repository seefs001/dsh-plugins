# dsh-plugins 文档站

基于 Fumadocs、Next.js 和 Tailwind CSS，纯静态导出到 GitHub Pages。与 `packages/*` 插件独立，不参与 npm 插件打包。

## 本地运行

以下命令均在仓库根目录执行：

```bash
pnpm install
pnpm run docs:dev        # http://localhost:3000
pnpm run docs:typecheck
pnpm run docs:build     # 输出到 apps/docs/out
```

内容在 `content/docs/**/*.mdx`，导航顺序在相邻的 `meta.json`。无需外部字体、搜索服务或部署密钥。

## GitHub Pages

1. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
2. 将改动合入 `main`，或在 `main` 手动运行 **Documentation** 工作流。
3. 部署成功后访问 <https://seefs001.github.io/dsh-plugins/>。

工作流对 PR 仅执行类型检查与静态构建；只有 `main` 部署 job 获得 Pages 写入和 OIDC 权限。无需 `gh-pages` 分支。

工作流按仓库名设置 `NEXT_PUBLIC_BASE_PATH=/dsh-plugins`。本地开发默认根路径。模拟 Pages 构建：

```bash
NEXT_PUBLIC_BASE_PATH=/dsh-plugins pnpm run docs:build
```

预览构建产物时，把 `apps/docs/out` 挂载在 `/dsh-plugins/`。首页、导航、资源、favicon 与搜索索引都需要在这个前缀下访问。搜索 endpoint `/dsh-plugins/search-index.json` 是构建时输出的静态文件，不需要后端。

若使用域名根路径部署，移除工作流中的 `NEXT_PUBLIC_BASE_PATH`，重新构建，再按 Pages 设置配置域名。

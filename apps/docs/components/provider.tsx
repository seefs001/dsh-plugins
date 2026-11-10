'use client'

import { RootProvider } from 'fumadocs-ui/provider/next'
import type { Translations } from 'fumadocs-ui/i18n'
import type { ReactNode } from 'react'
import StaticSearchDialog from './search'

const translations = {
  'Search(search trigger)': '搜索文档',
  'Open Search(search trigger)(aria-label)': '打开搜索',
  'Search(search dialog)': '搜索文档',
  'Close Search(search dialog)(aria-label)': '关闭搜索',
  'No results found(search dialog)': '没有找到相关内容',
  'Search failed(search dialog)': '搜索失败',
  'Search failed, showing results for {query}(search dialog)': '搜索失败，显示 {query} 的结果',
  'On this page(table of contents)': '本页目录',
  'No Headings(table of contents)': '本页暂无目录',
  'Next Page(pagination)': '下一页',
  'Previous Page(pagination)': '上一页',
  'Edit on GitHub(edit page)': '在 GitHub 上编辑此页',
  'Last updated on(page footer)': '最后更新',
  'Toggle Theme(theme switcher)(aria-label)': '切换主题',
  'Light(theme switcher)(aria-label)': '浅色',
  'Dark(theme switcher)(aria-label)': '深色',
  'System(theme switcher)(aria-label)': '跟随系统',
  'Open Sidebar(sidebar)(aria-label)': '打开侧边栏',
  'Close Sidebar(sidebar)(aria-label)': '关闭侧边栏',
  'Collapse Sidebar(sidebar)(aria-label)': '折叠侧边栏',
  'Toggle Menu(mobile menu)(aria-label)': '切换菜单',
  'Skip to Content(skip link)': '跳到正文',
  'Copy Text(code block)(aria-label)': '复制代码',
  'Copied Text(code block)(aria-label)': '已复制代码',
  'Copy Anchor Link(heading anchor)(aria-label)': '复制标题链接',
  'Copied Anchor Link(heading anchor)(aria-label)': '已复制标题链接',
} satisfies Partial<Translations>

export function Provider({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      search={{ SearchDialog: StaticSearchDialog }}
      i18n={{ locale: 'zh', translations }}
    >
      {children}
    </RootProvider>
  )
}

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Provider } from '@/components/provider'
import { withBasePath } from '@/lib/site'
import './global.css'

export const metadata: Metadata = {
  title: {
    default: 'seefs/dsh-plugins：seefs 的 DeepSeek Harness 插件',
    template: '%s | dsh-plugins',
  },
  description: 'seefs 自用的 DeepSeek Harness 插件：安装、配置、依赖和使用边界。',
  icons: { icon: withBasePath('/icon.svg') },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}

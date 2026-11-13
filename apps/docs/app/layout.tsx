import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Provider } from '@/components/provider'
import { withBasePath } from '@/lib/site'
import './global.css'

export const metadata: Metadata = {
  title: {
    default: 'dsh-plugins：DeepSeek Harness 插件集',
    template: '%s | dsh-plugins',
  },
  description: 'DeepSeek Harness 社区插件的安装、配置、版本要求和使用边界。',
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

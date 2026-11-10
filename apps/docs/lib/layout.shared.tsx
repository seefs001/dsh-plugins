import { Blocks } from 'lucide-react'
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { repository } from './site'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <span className="flex size-8 items-center justify-center rounded-lg bg-fd-primary text-fd-primary-foreground">
            <Blocks className="size-4" />
          </span>
          <span className="font-mono font-semibold tracking-tight">dsh-plugins</span>
        </>
      ),
    },
    githubUrl: repository,
    links: [{ text: '文档', url: '/docs' }],
  }
}

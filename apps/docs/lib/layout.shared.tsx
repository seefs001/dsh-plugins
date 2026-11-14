import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { repository } from './site'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <span aria-hidden className="dp-logo">#</span>
          <span className="font-mono font-semibold tracking-tight">seefs/dsh-plugins</span>
        </>
      ),
    },
    githubUrl: repository,
    links: [
      { text: '安装', url: '/docs/quick-start' },
      { text: '插件', url: '/docs/plugins' },
      { text: '依赖与边界', url: '/docs/compatibility' },
    ],
  }
}

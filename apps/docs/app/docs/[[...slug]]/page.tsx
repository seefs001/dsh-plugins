import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import { getMDXComponents } from '@/components/mdx'
import { repository } from '@/lib/site'
import { source } from '@/lib/source'

type Props = { params: Promise<{ slug?: string[] }> }

export const dynamicParams = false

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = source.getPage((await params).slug)
  if (!page) notFound()
  return { title: page.data.title, description: page.data.description }
}

export default async function Page({ params }: Props) {
  const page = source.getPage((await params).slug)
  if (!page) notFound()
  const MDX = page.data.body

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </DocsBody>
      <a
        href={`${repository}/edit/main/apps/docs/content/docs/${page.path}`}
        className="mt-8 text-sm text-fd-muted-foreground hover:text-fd-primary"
        target="_blank"
        rel="noreferrer noopener"
      >
        在 GitHub 上编辑此页 ↗
      </a>
    </DocsPage>
  )
}

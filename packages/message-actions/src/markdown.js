import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const h = React.createElement
const markdownPlugins = [remarkGfm]

export default function MarkdownRenderer({ text, components }) {
  return h(ReactMarkdown, { remarkPlugins: markdownPlugins, components }, text)
}

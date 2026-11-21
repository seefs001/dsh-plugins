import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

const config = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  reactStrictMode: true,
}

export default withMDX(config)

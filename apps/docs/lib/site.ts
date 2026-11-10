export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
export const repository = 'https://github.com/seefs001/dsh-plugins'

export function withBasePath(path: string) {
  return `${basePath}${path}`
}

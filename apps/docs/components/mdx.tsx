import defaultComponents from 'fumadocs-ui/mdx'
import { Step, Steps } from 'fumadocs-ui/components/steps'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import type { MDXComponents } from 'mdx/types'
import { InstallAll, InstallCommand, PluginDirectory, PluginFacts, RequirementsTable } from './plugins'

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultComponents,
    Step,
    Steps,
    Tab,
    Tabs,
    InstallAll,
    InstallCommand,
    PluginDirectory,
    PluginFacts,
    RequirementsTable,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}

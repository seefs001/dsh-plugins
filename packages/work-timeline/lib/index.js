import { definition } from './model.js'
import { apply as registerTools } from './tools.js'

export const name = 'work-timeline'
export const inject = ['sessionProjections']

// Keep replay and Client views available even when no Work-enabled Agent is active.
export async function apply(ctx) {
  await ctx.sessionProjections.register(definition)
  ctx.provide('workTimeline', { registerTools })
}

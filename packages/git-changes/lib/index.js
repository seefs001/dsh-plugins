/**
 * dsh-git-changes — Host half.
 *
 * Nothing runs on the Host; the plugin lives entirely in lib/client.js and
 * reads the forge panel's Remote. The Loader still needs a Host module for the
 * bundle row.
 */
export const name = 'git-changes'

export function apply() {}

#!/usr/bin/env node
/** Read-only plugin inspection. Reports never execute plugin code or scripts. */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const HELP = `Plugin repository inspector

Usage:
  node scripts/inspect-plugins.mjs [options]

Options:
  --root DIR                    Repository to scan (default: current directory)
  --format html|json|markdown    Report format (default: markdown)
  --output FILE                 Write a report (default: stdout)
  --force                       Allow replacing an existing output file
  --strict                      Also fail when warnings are found
  --help, -h                    Show this help

Exit codes: 0 = no errors; 1 = errors (or warnings with --strict);
            2 = invalid arguments, scanning failure, or output failure.
Reports are written before returning finding-based exit code 1.
No dependencies are installed, no plugin code is loaded, and no tests are run.
`

function parseArguments(args) {
  const options = { root: process.cwd(), format: 'markdown', output: null, strict: false, force: false, help: false }
  const values = new Set(['--root', '--format', '--output'])
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--help' || argument === '-h') options.help = true
    else if (argument === '--strict') options.strict = true
    else if (argument === '--force') options.force = true
    else {
      const separator = argument.indexOf('=')
      const key = separator < 0 ? argument : argument.slice(0, separator)
      if (!values.has(key)) throw new Error(`Unknown argument: ${argument}. Use --help for usage.`)
      const value = separator < 0 ? args[++index] : argument.slice(separator + 1)
      if (!value || value.startsWith('--')) throw new Error(`${key} requires a value.`)
      options[key.slice(2)] = value
    }
  }
  if (!['html', 'json', 'markdown'].includes(options.format)) {
    throw new Error(`Unsupported format "${options.format}". Choose html, json, or markdown.`)
  }
  return options
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(HELP)
    return
  }

  const { scanRepository } = await import('./plugin-inspector/scan.mjs')
  const report = await scanRepository(resolve(options.root))
  let content
  if (options.format === 'json') content = JSON.stringify(report, null, 2)
  else if (options.format === 'html') {
    const { renderHtml } = await import('./plugin-inspector/render-html.mjs')
    content = renderHtml(report)
  } else {
    const { renderMarkdown } = await import('./plugin-inspector/format-markdown.mjs')
    content = renderMarkdown(report)
  }
  if (!content.endsWith('\n')) content += '\n'

  if (options.output !== null) {
    const output = resolve(options.output)
    await mkdir(dirname(output), { recursive: true })
    try {
      await writeFile(output, content, { encoding: 'utf8', flag: options.force ? 'w' : 'wx' })
    } catch (error) {
      if (error.code === 'EEXIST') throw new Error(`Output already exists: ${output}. Choose another path or use --force.`, { cause: error })
      throw new Error(`Cannot write report to ${output}: ${error.message}`, { cause: error })
    }
    process.stderr.write(`Report written: ${output}\n`)
  } else process.stdout.write(content)

  const { packages, errors, warnings } = report.summary
  process.stderr.write(`Inspected ${packages} plugins: ${errors} error(s), ${warnings} warning(s). Static checks only.\n`)
  if (errors > 0 || (options.strict && warnings > 0)) process.exitCode = 1
}

main().catch(error => {
  process.stderr.write(`Plugin inspector: ${error.message}\n`)
  process.exitCode = 2
})

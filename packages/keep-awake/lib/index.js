import { spawn } from 'node:child_process'
import { once } from 'node:events'

export const name = 'keep-awake'

export async function apply(ctx) {
  const logger = ctx.logger
  if (process.platform !== 'darwin') {
    logger.warn('keep-awake: macOS only; idle sleep prevention is inactive on this platform.')
    return
  }

  await ctx.effect(async function* () {
    // -i leaves display sleep alone; -w releases the assertion even after a Host crash.
    const child = spawn('/usr/bin/caffeinate', ['-i', '-w', String(process.pid)], {
      stdio: 'ignore',
    })
    const started = once(child, 'spawn')
    const closed = new Promise(resolve => child.once('close', resolve))
    let stopping = false

    child.on('error', error => {
      logger.error('keep-awake: caffeinate failed:', error)
    })
    child.once('exit', (code, signal) => {
      if (!stopping) {
        logger.warn(`keep-awake: caffeinate exited unexpectedly (${signal ?? code}); idle sleep prevention stopped. Disable and re-enable the plugin to retry.`)
      }
    })

    // Register cleanup before awaiting startup, including failed or superseded activation.
    yield async () => {
      stopping = true
      // Keep shutdown alive only while the owned helper is being reaped.
      child.ref()
      if (child.pid && child.exitCode === null && child.signalCode === null) child.kill()
      await closed
    }

    await started
    // The helper must not keep an otherwise finished DSH Host alive.
    child.unref()
    logger.info('keep-awake: preventing macOS idle sleep; display sleep and screen locking are unchanged.')
  }, 'keep-awake: caffeinate')
}

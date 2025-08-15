import type {Context, Middleware} from 'grammy'
import type {Update} from 'grammy/types'
import type {AppLogger} from '../../lib/logger.js'

export const addLoggerToContext: Middleware<Context & {update: Update & {log?: AppLogger}}> = (
  ctx,
  next,
) => {
  if (!ctx.update.log) throw new Error('Logger not found')
  ctx.log = ctx.update.log
  delete ctx.update.log
  return next()
}

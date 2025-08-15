import {logger} from '../lib/logger.js'
import type {Middleware} from 'koa'

export const requestLogger: Middleware = async (ctx, next) => {
  const reqId = Math.random().toString(36).substring(2, 10)
  const log = logger.child({reqId})
  ctx.log = log

  const startRequestTime = Date.now()
  await next().catch((error: unknown) => {
    ctx.log.error({error}, 'request error')
    throw error
  })
  const responseTime = Date.now() - startRequestTime
  ctx.log.info(`${ctx.method} ${ctx.url} - ${responseTime}ms`)
}

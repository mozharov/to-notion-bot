import Router from '@koa/router'
import {botWebhookCallback} from '../middlewares/bot-webhook-callback.js'

export const botRouter = new Router()
botRouter.post(
  '/bot',
  async (ctx, next) => {
    const originalUpdate: unknown = ctx.request.body
    if (originalUpdate && typeof originalUpdate === 'object') {
      ;(originalUpdate as {log?: unknown}).log = ctx.log
    }
    await next()
  },
  botWebhookCallback,
)

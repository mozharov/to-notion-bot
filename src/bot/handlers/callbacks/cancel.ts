import type {CallbackQueryMiddleware, Context} from 'grammy'
import {clearState} from '../../services/session.js'

export const cancelCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('cancel callback')
  await clearState(ctx.from.id)
  await ctx.deleteMessage()
  await ctx.reply(ctx.t('action-canceled'))
}

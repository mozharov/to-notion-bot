import type {Context} from 'grammy'
import type {ChatTypeContext, NextFunction} from 'grammy'
import {clearState} from '../../services/session.js'
import {config} from '../../../config.js'
import {getOrCreateUser} from '../../../models/users.js'

export async function feedbackAction(ctx: ChatTypeContext<Context, 'private'>, next: NextFunction) {
  ctx.tracker.capture('feedback action')
  await clearState(ctx.from.id)
  const message = ctx.message
  if (!message) {
    await ctx.reply(ctx.t('action-canceled'))
    return next()
  }
  const user = await getOrCreateUser(ctx.from.id)
  await ctx.api.sendMessage(
    config.TG_ADMIN_ID,
    `Feedback from @${ctx.from.username}.\n${JSON.stringify(user, null, 2)}`,
  )
  await ctx.copyMessage(config.TG_ADMIN_ID)
  await ctx.reply(ctx.t('feedback.sent'))
}

import {Composer} from 'grammy'
import {Context} from '../context'

export const startComposer = new Composer<Context>()

startComposer.chatType('private').command(['start', 'safe', 'restart'], async (ctx, next) => {
  await ctx.conversation.exit()
  await ctx.reply(ctx.t('start'), {parse_mode: 'HTML'})
  return next()
})

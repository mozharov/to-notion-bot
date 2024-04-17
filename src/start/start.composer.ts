import {Composer} from 'grammy'
import {Context} from '../context'

export const startComposer = new Composer<Context>()

startComposer.chatType('private').command(['start', 'safe', 'restart'], async (ctx, next) => {
  await ctx.conversation.exit()
  await ctx.reply(ctx.t('start'), {parse_mode: 'HTML'})
  await next()
  await ctx.replyWithChatAction('typing')
  await new Promise(resolve => setTimeout(resolve, 2000))
  await ctx.reply(ctx.t('about-author'), {parse_mode: 'HTML'})
})

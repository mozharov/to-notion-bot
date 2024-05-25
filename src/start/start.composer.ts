import {Composer} from 'grammy'
import {Context} from '../context'

export const startComposer = new Composer<Context>()

startComposer
  .chatType('private')
  .command('start')
  .use(async (ctx, next) => {
    await ctx.conversation.exit()
    await ctx.reply(ctx.t('start'), {parse_mode: 'HTML', link_preview_options: {is_disabled: true}})
    await next()
    await ctx.replyWithChatAction('typing')
    await new Promise(resolve => setTimeout(resolve, 1800))
    await ctx.reply(ctx.t('about-author'), {parse_mode: 'HTML'})
  })

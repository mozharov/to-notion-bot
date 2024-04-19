import {Composer} from 'grammy'
import {Context} from '../context'
import {isAdmin} from '../users/users.filters'
import {startService} from './start.service'

export const startComposer = new Composer<Context>()

startComposer
  .chatType('private')
  .command('start')
  .use(async (ctx, next) => {
    await ctx.conversation.exit()
    await ctx.reply(ctx.t('start'), {parse_mode: 'HTML'})
    await next()
    await ctx.replyWithChatAction('typing')
    await new Promise(resolve => setTimeout(resolve, 1800))
    await ctx.reply(ctx.t('about-author'), {parse_mode: 'HTML'})
  })

startComposer
  .chatType('private')
  .command('transfer_old_subscriptions')
  .filter(isAdmin)
  .use(() => startService.transferOldSubscriptions())

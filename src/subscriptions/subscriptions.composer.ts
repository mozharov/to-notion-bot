import {Composer, InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {usersService} from '../users/users.service'
import {showSubscriptionStatus} from './subscriptions.actions'
import {subscriptionsService} from './subscriptions.service'

export const subscriptionsComposer = new Composer<Context>()

const privateChat = subscriptionsComposer.chatType('private')

privateChat
  .command(['subscribe', 'subscription', 'subscriptions', 'membership'])
  .use(showSubscriptionStatus)
privateChat.callbackQuery('subscribe').use(showSubscriptionStatus)

privateChat.command('start').use(async (ctx, next) => {
  const user = await usersService.findUserByTelegramId(ctx.from.id)
  if (!user) {
    const user = await usersService.getOrCreateUser(ctx.from.id)
    await subscriptionsService.giveDaysToUser(user, 30)
    const keyboard = new InlineKeyboard().add({
      callback_data: 'subscribe',
      text: ctx.t('new-user.status'),
    })
    await ctx.reply(ctx.t('new-user'), {
      reply_markup: keyboard,
      parse_mode: 'HTML',
    })
  }
  return next()
})

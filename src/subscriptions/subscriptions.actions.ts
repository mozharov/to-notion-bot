import {ChatTypeContext, InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {usersService} from '../users/users.service'
import {subscriptionsService} from './subscriptions.service'

export async function showSubscriptionStatus(
  ctx: ChatTypeContext<Context, 'private'>,
): Promise<void> {
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const subscription = await subscriptionsService.findActiveSubscriptionByUser(user)

  const keyboard = new InlineKeyboard().add({
    callback_data: 'plans',
    text: ctx.t(`subscription.${subscription?.isActive ? 'renew' : 'subscribe'}`),
  })

  await ctx.reply(
    ctx.t('subscription', {
      status: String(subscription?.isActive),
      endsAt: subscription?.endsAt ?? 'N/A',
      daysLeft: subscription?.daysLeft ?? 'N/A',
    }),
    {reply_markup: keyboard, parse_mode: 'HTML'},
  )
  return
}

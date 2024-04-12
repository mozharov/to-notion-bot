import {ChatTypeContext, InlineKeyboard, NextFunction} from 'grammy'
import {Context} from '../context'
import {usersService} from '../users/users.service'
import {subscriptionsService} from './subscriptions.service'

export async function giveSubscription(
  ctx: ChatTypeContext<Context, 'private'>,
  next?: NextFunction,
): Promise<void> {
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const subscription = await subscriptionsService.findActiveSubscriptionByUser(user)

  const keyboard = new InlineKeyboard().add({
    callback_data: 'subscribe',
    text: ctx.t(`subscription.${subscription?.isActive ? 'renew' : 'subscribe'}`),
  })

  const locale = await ctx.i18n.getLocale()
  await ctx.reply(
    ctx.t('subscription', {
      status: String(subscription?.isActive),
      endsAt: subscription?.endsAt.toLocaleDateString(locale) ?? 'N/A',
      daysLeft: subscription?.daysLeft ?? 'N/A',
    }),
    {reply_markup: keyboard, parse_mode: 'HTML'},
  )
  if (next) return next()
  return
}

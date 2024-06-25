import {Composer} from 'grammy'
import {analytics} from './analytics.service'
import {Context} from '../context'
import {subscriptionsService} from '../subscriptions/subscriptions.service'

export const analyticsComposer = new Composer<Context>()

analyticsComposer.chatType('private').use(async (ctx, next) => {
  const hasSubscription = await subscriptionsService.hasActiveSubscriptionByTelegramUserId(
    ctx.from.id,
  )
  analytics.identify(ctx.from.id, {
    language_code: ctx.from.language_code,
    telegram_premium: ctx.from.is_premium,
    first_name: ctx.from.first_name,
    last_name: ctx.from.last_name,
    username: ctx.from.username,
    has_subscription: hasSubscription,
  })
  return next()
})

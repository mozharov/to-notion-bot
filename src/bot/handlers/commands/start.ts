import type {ChatTypeContext, Context, Middleware} from 'grammy'
import {getChatsByOwnerTelegramId} from '../../../models/chats.js'
import {buildChatsKeyboard} from '../../helpers/keyboards/chats.js'
import {getOrCreateUser} from '../../../models/users.js'
import {buildSubscriptionKeyboard} from '../../helpers/keyboards/subscription.js'
import {isUserHasLifetimeAccess} from '../../helpers/user.js'
import {config} from '../../../config.js'

// posthog-js generates a UUID as the anonymous distinct_id for landing-page visitors;
// we recognize that shape here to merge it into the Telegram user's PostHog profile.
const LANDING_DISTINCT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const startCommand: Middleware<ChatTypeContext<Context, 'private'>> = async ctx => {
  const startParam = ctx.match

  if (typeof startParam === 'string' && LANDING_DISTINCT_ID_PATTERN.test(startParam)) {
    ctx.tracker.alias(startParam)
  }

  if (startParam === 'subscription') {
    ctx.tracker.capture('start command with subscription')
    const user = await getOrCreateUser(ctx.from.id)
    if (isUserHasLifetimeAccess(user)) {
      await ctx.reply(ctx.t('subscription.already-has'))
      return
    }
    await ctx.reply(
      ctx.t('subscription', {
        monthlyStars: config.subscriptionMonthlyPriceStars,
        monthlyUsd: config.SUBSCRIPTION_MONTHLY_PRICE_USD,
        yearlyStars: config.subscriptionYearlyPriceStars,
        yearlyUsd: config.SUBSCRIPTION_YEARLY_PRICE_USD,
        lifetimeStars: config.subscriptionLifetimePriceStars,
        lifetimeUsd: config.SUBSCRIPTION_LIFETIME_PRICE_USD,
      }),
      {
        reply_markup: buildSubscriptionKeyboard(ctx.t),
      },
    )
    return
  }

  ctx.tracker.capture('start command')
  await ctx.reply(ctx.t('start'), {link_preview_options: {is_disabled: true}})

  await getOrCreateUser(ctx.from.id)

  const chats = await getChatsByOwnerTelegramId(ctx.from.id)
  const keyboard = buildChatsKeyboard(ctx.t, chats)
  await ctx.reply(ctx.t('chats'), {reply_markup: keyboard})
}

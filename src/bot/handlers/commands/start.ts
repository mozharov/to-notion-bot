import type {ChatTypeContext, Context, Middleware} from 'grammy'
import {getChatsByOwnerTelegramId} from '../../../models/chats.js'
import {buildChatsKeyboard} from '../../helpers/keyboards/chats.js'
import {getOrCreateUser} from '../../../models/users.js'
import {buildSubscriptionKeyboard} from '../../helpers/keyboards/subscription.js'
import {isUserHasLifetimeAccess} from '../../helpers/user.js'
import {config} from '../../../config.js'

export const startCommand: Middleware<ChatTypeContext<Context, 'private'>> = async ctx => {
  const startParam = ctx.match

  if (startParam === 'lifetime_subscription') {
    ctx.tracker.capture('start command with lifetime subscription')
    const user = await getOrCreateUser(ctx.from.id)
    if (isUserHasLifetimeAccess(user)) {
      await ctx.reply(ctx.t('subscription.already-has'))
      return
    }
    const telegramStarsPrice = config.LIFETIME_ACCESS_TELEGRAM_STARS_PRICE
    await ctx.reply(
      ctx.t('subscription', {
        telegramStarsPrice,
        telegramStarsUsd: (telegramStarsPrice * config.TELEGRAM_STARS_TO_USD).toFixed(0),
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

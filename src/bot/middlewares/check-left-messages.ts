import {InlineKeyboard, type Middleware} from 'grammy'
import {getChatByTelegramId} from '../../models/chats.js'
import {bot} from '../bot.js'
import {getSubscriptionUrl} from '../helpers/urls/subscription.js'

export const checkLeftMessages: Middleware = async (ctx, next) => {
  if (!ctx.chatId) return next()
  const chat = await getChatByTelegramId(ctx.chatId)
  if (!chat) return next()
  if (chat.owner.leftMessages === 0) {
    ctx.tracker.capture('left messages limit reached')
    return ctx.reply(
      ctx.t('left-messages-limit-reached', {
        botUsername: bot.botInfo.username,
      }),
      {
        reply_markup: new InlineKeyboard().add({
          text: ctx.t('subscription.button'),
          url: getSubscriptionUrl(),
        }),
      },
    )
  }
  return next()
}

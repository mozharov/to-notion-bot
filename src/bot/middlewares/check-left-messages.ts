import {InlineKeyboard, type Middleware} from 'grammy'
import {getChatByTelegramId} from '../../models/chats.js'
import {updateUser} from '../../models/users.js'
import {bot} from '../bot.js'

export const checkLeftMessages: Middleware = async (ctx, next) => {
  if (!ctx.chatId) return next()
  const chat = await getChatByTelegramId(ctx.chatId)
  if (!chat) return next()
  if (chat.owner.leftMessages === 0)
    return ctx.reply(
      ctx.t('left-messages-limit-reached', {
        botUsername: bot.botInfo.username,
      }),
      {
        reply_markup: new InlineKeyboard().add({
          text: ctx.t('left-messages-limit-reached.button'),
          url: `https://t.me/${bot.botInfo.username}?start=lifetime_subscription`,
        }),
      },
    )
  else if (chat.owner.leftMessages > 0) {
    await updateUser(chat.owner.id, {leftMessages: chat.owner.leftMessages - 1})
  }
  return next()
}

import type {Middleware} from 'grammy'
import {getChatByTelegramId} from '../../models/chats.js'

export const identifyUser: Middleware = async (ctx, next) => {
  if (!ctx.from) return next()
  const chat = await getChatByTelegramId(ctx.from.id)
  ctx.tracker.identify({
    language_code: ctx.from.language_code,
    telegram_premium: ctx.from.is_premium,
    first_name: ctx.from.first_name,
    last_name: ctx.from.last_name,
    username: ctx.from.username,
    left_messages: chat?.owner.leftMessages,
  })
  return next()
}

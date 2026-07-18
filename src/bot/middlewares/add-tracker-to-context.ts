import type {Middleware} from 'grammy'
import {Tracker} from '../lib/tracker.js'
import {getChatByTelegramId} from '../../models/chats.js'

export const addTrackerToContext: Middleware = async (ctx, next) => {
  let distinctId = ctx.from?.id.toString()
  // Channel posts and anonymous group messages have no `from` - attribute them to the chat owner instead.
  if (!distinctId && ctx.chat) {
    const chat = await getChatByTelegramId(ctx.chat.id)
    distinctId = chat?.owner.telegramId.toString()
  }
  ctx.tracker = new Tracker(distinctId)
  return next()
}

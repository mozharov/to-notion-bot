import {Composer} from 'grammy'
import {Context} from '../context'
import {ChatsService} from './chats.service'

export const chatsComposer = new Composer<Context>()

chatsComposer.use(async (ctx, next) => {
  ctx.chatsService = new ChatsService()
  if (!ctx.chat) return next()
  ctx.chatEntity = await ctx.chatsService.getChatByTelegramId(ctx.chat.id)
  return next()
})

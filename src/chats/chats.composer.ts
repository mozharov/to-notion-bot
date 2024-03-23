import {Composer} from 'grammy'
import {Context} from '../context'
import {ChatsService} from './chats.service'
import {LoggerService} from '../logger/logger.service'

export const chatsComposer = new Composer<Context>()

chatsComposer.use(async (ctx, next) => {
  ctx.chatsService = new ChatsService()
  if (!ctx.chat) return next()
  ctx.chatEntity = await ctx.chatsService.getChatByTelegramId(ctx.chat.id)
  return next()
})

// Automatically update chat id when chat is migrated to supergroup
chatsComposer
  .on('message:migrate_from_chat_id')
  .on('message:migrate_to_chat_id')
  .filter(ctx => !!ctx.chatEntity?.id)
  .use(async ctx => {
    const logger = new LoggerService('ChatsComposer')
    logger.info({
      message: 'Chat migration',
      from: ctx.message.migrate_from_chat_id,
      to: ctx.message.migrate_to_chat_id,
    })
    if (!ctx.chatEntity?.id) {
      throw new Error('Chat entity is not found when chat migration event is triggered')
    }

    await Promise.all([
      ctx.chatsService.updateChat({
        id: ctx.chatEntity.id,
        telegramId: ctx.message.migrate_to_chat_id,
      }),
      ctx.sessionService.deleteSesionsByChatId(ctx.message.migrate_from_chat_id),
    ])
  })

// Only registered chats
chatsComposer.chatType(['group', 'supergroup']).use(async (ctx, next) => {
  if (ctx.chatEntity?.id) return next()
})

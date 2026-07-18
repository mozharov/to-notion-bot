import type {Middleware} from 'grammy'
import {bot} from '../bot.js'
import {getChatByTelegramId} from '../../models/chats.js'

export const onlyActiveChat: Middleware = async (ctx, next) => {
  if (!ctx.chat) return
  const chat = await getChatByTelegramId(ctx.chat.id)
  if (chat?.status !== 'active') {
    ctx.tracker.capture('message ignored, chat not active', {chatType: ctx.chat.type})
    if (ctx.chat.type === 'private') await ctx.reply(ctx.t('chat-is-not-active'))
    return
  }
  if (!chat.notionDatabaseId || !chat.notionWorkspaceId) {
    ctx.tracker.capture('message ignored, notion not connected', {chatType: chat.type})
    await ctx.reply(
      ctx.t('notion-is-not-active', {
        type: chat.type !== 'private' ? 'group' : 'private',
        botUsername: bot.botInfo.username,
      }),
    )
    return
  }
  return next()
}

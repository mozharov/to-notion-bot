import {ChatTypeContext, NextFunction} from 'grammy'
import {chatsService} from '../chats/chats.service'
import {Context} from '../context'
import {LoggerService} from '../logger/logger.service'

const logger = new LoggerService('MessagesMiddlewares')

export async function onlyActiveChat(ctx: Context, next: NextFunction): Promise<void> {
  if (!ctx.chat) return
  const chat = await chatsService.getActiveChatByTelegramId(ctx.chat.id)
  if (!chat) {
    if (ctx.chat.type === 'private') {
      await ctx.reply(ctx.t('chat-is-not-active'), {parse_mode: 'HTML'})
    }
    return
  }
  if (!chat.notionDatabase || !chat.notionWorkspace) {
    await ctx.reply(ctx.t('notion-is-not-active'), {parse_mode: 'HTML'})
    return
  }
  return next()
}

export async function checkMentionMode(
  ctx: ChatTypeContext<Context, 'group' | 'supergroup'>,
  next: NextFunction,
): Promise<void> {
  const chat = await chatsService.findChatByTelegramId(ctx.chat.id)
  if (chat?.onlyMentionMode && ctx.message?.text) {
    const mention = ctx.message?.entities?.find(entity => {
      return (
        entity.type === 'mention' &&
        ctx.message?.text?.slice(entity.offset, entity.offset + entity.length) ===
          `@${ctx.me.username}`
      )
    })
    if (!mention) {
      logger.debug('Bot is not mentioned')
      return
    }

    const mentionText = ctx.message.text.slice(mention.offset, mention.offset + mention.length)
    if (!ctx.message.text.startsWith(mentionText)) return next()

    ctx.message.text = ctx.message.text.slice(mention.length)
    ctx.message.entities = ctx.message.entities?.filter(
      entity =>
        entity.offset !== mention.offset &&
        entity.length !== mention.length &&
        entity.type !== 'mention',
    )
  }
  return next()
}

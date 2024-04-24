import {ChatTypeContext, NextFunction} from 'grammy'
import {chatsService} from '../chats/chats.service'
import {Context} from '../context'
import {LoggerService} from '../logger/logger.service'
import {getSenderId} from './messages.helper'
import {messagesService} from './messages.service'
import {config} from '../config/config.service'

const logger = new LoggerService('MessagesMiddlewares')

export async function onlyActiveChat(ctx: Context, next: NextFunction): Promise<void> {
  if (!ctx.chat) return
  const chat = await chatsService.findActiveChatByTelegramId(ctx.chat.id)
  if (!chat) {
    if (ctx.chat.type === 'private') {
      await ctx.reply(ctx.t('chat-is-not-active'), {parse_mode: 'HTML'})
    }
    return
  }
  if (!chat.notionDatabase || !chat.notionWorkspace) {
    await ctx.reply(
      ctx.t('notion-is-not-active', {
        type: chat.type !== 'private' ? 'group' : 'private',
        botUsername: config.get('BOT_USERNAME'),
      }),
      {parse_mode: 'HTML'},
    )
    return
  }
  return next()
}

export async function checkMentionMode(
  ctx: ChatTypeContext<Context, 'group' | 'supergroup'>,
  next: NextFunction,
): Promise<void> {
  const chat = await chatsService.findChatByTelegramId(ctx.chat.id)
  if (chat?.onlyMentionMode) {
    const message = ctx.message ?? ctx.channelPost
    const text = message?.text ?? message?.caption
    const entities = message?.entities ?? message?.caption_entities
    if (!message || !text || !entities) return
    const senderId = getSenderId(ctx)
    const sameTimeMessage = await messagesService.findSameTimeMessage(chat, senderId, message.date)
    if (sameTimeMessage) {
      logger.debug('It is update message')
      return next()
    }
    const botUsername = `@${ctx.me.username}`

    const mention = entities.find(entity => {
      return (
        entity.type === 'mention' &&
        text.slice(entity.offset, entity.offset + entity.length) === botUsername
      )
    })
    if (!mention) {
      logger.debug('Bot is not mentioned')
      return
    }

    const mentionText = text.slice(mention.offset, mention.offset + mention.length)
    if (!text.startsWith(mentionText)) return next()

    message.text = text.slice(mention.length)
    message.entities = entities.filter(
      entity =>
        entity.offset !== mention.offset &&
        entity.length !== mention.length &&
        entity.type !== 'mention',
    )
  }
  return next()
}

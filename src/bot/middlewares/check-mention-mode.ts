import type {Context, ChatTypeContext, Middleware} from 'grammy'
import {getChatByTelegramId} from '../../models/chats.js'
import {getSenderId} from '../helpers/sender-id.js'
import {getSameTimeMessage} from '../../models/messages.js'

export const checkMentionMode: Middleware<
  ChatTypeContext<Context, 'group' | 'supergroup'>
> = async (ctx, next) => {
  const chat = await getChatByTelegramId(ctx.chat.id)

  if (chat?.onlyMentionMode) {
    const message = ctx.message ?? ctx.channelPost
    const text = message?.text ?? message?.caption
    const entities = message?.entities ?? message?.caption_entities
    if (!message || !text || !entities) return

    const senderId = getSenderId(ctx)
    const sameTimeMessage = await getSameTimeMessage(chat.id, senderId, message.date)
    if (sameTimeMessage) return next()

    const mention = entities.find(entity => {
      return (
        entity.type === 'mention' &&
        text.slice(entity.offset, entity.offset + entity.length) === `@${ctx.me.username}`
      )
    })
    if (!mention) return

    const mentionText = text.slice(mention.offset, mention.offset + mention.length)
    if (!text.startsWith(mentionText)) return next()

    const mentionLength = mention.length

    const newText = text.slice(mentionLength)
    message.text = newText

    // Adjust offsets of all entities except the current mention
    message.entities = entities
      .filter(entity => entity !== mention) // Remove only the bot mention
      .map(entity => ({
        ...entity,
        offset: entity.offset - mentionLength,
      }))
      .filter(entity => entity.offset >= 0 && entity.offset + entity.length <= newText.length)
  }

  return next()
}

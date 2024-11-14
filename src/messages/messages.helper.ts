import {Message} from './entities/message.entity'
import {messagesService} from './messages.service'
import {Chat} from '../chats/entities/chat.entity'
import {Chat as GrammyChat, Update} from 'grammy/types'
import {Context} from '../context'
import {Message as GrammyMessage} from 'grammy/types'
import {chatsService} from '../chats/chats.service'
import {File as GrammyFile} from 'grammy/types'
import {LoggerService} from '../logger/logger.service'
import {TooBigFileError} from '../errors/too-big-file.error'
import {File} from '../files/entities/file.entity'

const logger = new LoggerService('MessagesHelper')

export async function getTelegramFile(
  ctx: Context & {chat: GrammyChat},
): Promise<GrammyFile | null> {
  const message = ctx.message ?? ctx.channelPost
  if (
    !message ||
    (!message.audio &&
      !message.video &&
      !message.photo &&
      !message.document &&
      !message.voice &&
      !message.video_note)
  ) {
    return null
  }
  try {
    const file = await ctx.getFile()
    // max size 3.4 MB
    // if (file.file_size && file.file_size > 3.4 * 1024 * 1024) {
    //   throw new TooBigFileError('File is too big')
    // }
    return file
  } catch (error) {
    const chat = await chatsService.findChatByTelegramId(ctx.chat.id)
    if (error && typeof error === 'object' && 'error_code' in error && error.error_code === 400) {
      logger.warn('File is too big')
      throw new TooBigFileError(chat?.languageCode)
    }
    logger.error('Error while getting file', error)
    throw error
  }
}

export function getFileType(message: GrammyMessage): File['type'] {
  if (message.audio || message.voice) return 'audio'
  if (message.video || message.video_note) return 'video'
  if (message.photo) return 'image'
  return 'file'
}

export function getSentAt(ctx: Context): number {
  const sentAt = ctx.message?.date ?? ctx.channelPost?.date
  if (!sentAt) throw new Error('No sentAt found in the context')
  return sentAt
}

export function getSenderId(ctx: Context & {chat: GrammyChat}): number {
  return ctx.from?.id ?? ctx.message?.sender_chat?.id ?? ctx.chat.id
}

export async function getPrevMessage(
  message: GrammyMessage & (Update.NonChannel | Update.Channel),
  chat: Chat,
): Promise<Message | null> {
  const senderId = message.from?.id ?? message.sender_chat?.id ?? message.chat.id
  const sameTimeMessage = await messagesService.findSameTimeMessage(chat, senderId, message.date)
  const replyToMessage = message.reply_to_message
    ? await messagesService.findOne({
        telegramMessageId: message.reply_to_message.message_id,
        chat,
      })
    : null
  return sameTimeMessage ?? replyToMessage
}

export function getLinkToOriginal(
  message: GrammyMessage & (Update.NonChannel | Update.Channel),
): string | null {
  if (message.forward_origin?.type === 'user') {
    const username = message.forward_origin.sender_user.username ?? null
    return username && `https://t.me/${username}`
  }
  if (message.forward_origin?.type === 'channel') {
    const username = message.forward_origin.chat.username ?? null
    return username && `https://t.me/${username}/${message.forward_origin.message_id}`
  }
  if (message.forward_origin?.type === 'chat') {
    if (message.forward_origin.sender_chat.type === 'group') return null
    const username = message.forward_origin.sender_chat.username ?? null
    return username && `https://t.me/${username}`
  }
  return null
}

export function getLinkToSender(
  message: GrammyMessage & (Update.NonChannel | Update.Channel),
): string | null {
  if (message.from?.username) {
    return `https://t.me/${message.from?.username}`
  }
  return null
}

import {Chat} from '../chats/entities/chat.entity'
import {Message} from './entities/message.entity'

import {Message as GrammyMessage} from 'grammy/types'
import {MessagesService} from './messages.service'

export async function shouldUpdateNotionPage(
  grammyMessage: GrammyMessage,
  chat: Chat,
): Promise<Message | false> {
  const replyToMessageId = grammyMessage.reply_to_message?.message_id
  if (replyToMessageId) {
    const messagesService = new MessagesService()
    const message = await messagesService.findOne(replyToMessageId, chat)
    return message ?? false
  }
  return false
}

export function buildLinkToNotionPage(pageId: string): string {
  return `https://www.notion.so/${pageId.replace(/-/g, '')}`
}

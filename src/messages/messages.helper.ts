import {Message} from './entities/message.entity'
import {MessagesService} from './messages.service'
import {MessageData} from './messages.composer'
import {Chat} from '../chats/entities/chat.entity'

export async function shouldUpdateNotionPage(
  data: MessageData,
  chat: Chat,
): Promise<Message | false> {
  const messagesService = new MessagesService()
  if (data.replyToMessage) {
    const message = await messagesService.findOne({
      telegramMessageId: data.replyToMessage,
      chat,
    })
    return message ?? false
  }
  if (data.from) {
    const sameTimeMessage = await messagesService.findSameTimeMessage(chat, data.from, data.time)
    return sameTimeMessage ?? false
  }
  return false
}

export function buildLinkToNotionPage(pageId: string): string {
  return `https://www.notion.so/${pageId.replace(/-/g, '')}`
}

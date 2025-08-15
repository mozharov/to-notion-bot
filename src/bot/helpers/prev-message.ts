import type {Chat} from '../../models/chats.js'
import {getSameTimeMessage, getOne, type Message} from '../../models/messages.js'
import type {Message as GrammyMessage} from 'grammy/types'

export async function getPrevMessage(message: GrammyMessage, chat: Chat): Promise<Message | null> {
  const senderId = message.from?.id ?? message.sender_chat?.id ?? message.chat.id
  const sameTimeMessage = await getSameTimeMessage(chat.id, senderId, message.date)
  const replyToMessage = message.reply_to_message
    ? await getOne({
        telegramMessageId: message.reply_to_message.message_id,
        chatId: chat.id,
      })
    : null
  return sameTimeMessage ?? replyToMessage
}

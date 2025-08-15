import {logger} from '../../lib/logger.js'
import {updateChat, getChatByTelegramIdOrThrow, getChatByTelegramId} from '../../models/chats.js'
import {bot} from '../bot.js'
import {translate} from '../lib/i18n.js'

export async function blockChatAndNotify(tgChatId: number) {
  const chat = await getChatByTelegramId(tgChatId)
  if (!chat) return
  if (chat.botStatus === 'blocked') return
  await updateChat(chat.id, {botStatus: 'blocked'})
  const chatOwner = await getChatByTelegramIdOrThrow(chat.owner.telegramId)
  const text = translate('chat-blocked', chatOwner.languageCode, {
    title: chat.title ?? chat.telegramId,
  })
  await bot.api.sendMessage(chatOwner.telegramId, text).catch((error: unknown) => {
    logger.error({error}, 'Failed to send message to owner')
  })
}

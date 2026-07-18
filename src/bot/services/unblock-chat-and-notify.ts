import {getChatByTelegramId, updateChat} from '../../models/chats.js'
import {createChat} from '../../models/chats.js'
import type {Chat, User} from 'grammy/types'
import {config} from '../../config.js'
import {translate} from '../lib/i18n.js'
import {countChatsByOwner} from '../../models/chats.js'
import {bot} from '../bot.js'
import {logger} from '../../lib/logger.js'
import {posthog} from '../../lib/posthog.js'

export async function unblockChatAndNotify(tgChat: Chat, tgUser: User) {
  const chatTitle = tgChat.title ?? tgChat.id.toString()
  const chatType = tgChat.type

  const chat = await getChatByTelegramId(tgChat.id)
  const ownerChat = await getChatByTelegramId(tgUser.id)
  if (!ownerChat) return

  if (!chat) {
    const type = chatType === 'channel' ? 'channel' : 'group'
    const countChats = await countChatsByOwner(ownerChat.ownerId)
    if (countChats >= config.MAX_CHATS_PER_USER) {
      posthog.capture({
        distinctId: ownerChat.telegramId.toString(),
        event: 'chat limit reached',
        properties: {type, chats: countChats},
      })
      const text = translate('max-chats-reached', ownerChat.languageCode)
      await bot.api.sendMessage(ownerChat.telegramId, text).catch((error: unknown) => {
        logger.error({error}, 'Failed to send message to owner')
      })
      return
    }

    await createChat({
      ownerId: ownerChat.ownerId,
      telegramId: tgChat.id,
      botStatus: 'unblocked',
      status: 'active',
      title: chatTitle,
      type,
      languageCode: ownerChat.languageCode,
      silentMode: true,
    })
    posthog.capture({
      distinctId: ownerChat.telegramId.toString(),
      event: 'group chat connected',
      properties: {type},
    })
  } else {
    await updateChat(chat.id, {
      ownerId: ownerChat.ownerId,
      title: chatTitle,
      botStatus: 'unblocked',
      status: 'active',
    })
    posthog.capture({
      distinctId: ownerChat.telegramId.toString(),
      event: 'group chat reconnected',
      properties: {type: chat.type},
    })
  }

  const text = translate('chat-unblocked', ownerChat.languageCode, {
    title: chatTitle,
  })
  await bot.api.sendMessage(ownerChat.telegramId, text).catch((error: unknown) => {
    logger.error({error}, 'Failed to send message to owner')
  })
}

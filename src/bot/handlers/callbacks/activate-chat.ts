import type {CallbackQueryMiddleware, Context} from 'grammy'
import {getChatByTelegramIdOrThrow, updateChat} from '../../../models/chats.js'
import {editMessageWithChatSettings} from '../../helpers/messages/edit-message-with-chat-settings.js'

export const activateChatCallback: CallbackQueryMiddleware<Context> = async ctx => {
  const {telegramId, action} = parseMatch(ctx.match)
  const chat = await getChatByTelegramIdOrThrow(telegramId)
  ctx.tracker.capture(`${action} chat callback`, {chatId: chat.id, chatType: chat.type})
  const newStatus = action === 'activate' ? 'active' : 'inactive'
  await updateChat(chat.id, {status: newStatus})
  await editMessageWithChatSettings(ctx, {...chat, status: newStatus})
}

function parseMatch(match: string | RegExpMatchArray): {
  telegramId: number
  action: 'activate' | 'deactivate'
} {
  const [, chatId, action] = match
  if (action !== 'activate' && action !== 'deactivate') throw new Error('Invalid action')
  return {telegramId: Number(chatId), action}
}

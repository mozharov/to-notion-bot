import type {CallbackQueryMiddleware} from 'grammy'
import type {Context} from 'grammy'
import {getChatByTelegramIdOrThrow, updateChat} from '../../../models/chats.js'
import {editMessageWithChatSettings} from '../../helpers/messages/edit-message-with-chat-settings.js'

export const toggleSilentModeCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('toggle silent mode callback')
  const {telegramId} = parseMatch(ctx.match)
  const chat = await getChatByTelegramIdOrThrow(telegramId)
  await updateChat(chat.id, {silentMode: !chat.silentMode})
  await editMessageWithChatSettings(ctx, {...chat, silentMode: !chat.silentMode})
}

function parseMatch(match: string | RegExpMatchArray): {
  telegramId: number
} {
  const [, chatId] = match
  return {telegramId: Number(chatId)}
}

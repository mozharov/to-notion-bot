import type {Context} from 'grammy'
import type {CallbackQueryMiddleware} from 'grammy'
import {getChatByTelegramIdOrThrow, updateChat} from '../../../models/chats.js'
import {editMessageWithChatSettings} from '../../helpers/messages/edit-message-with-chat-settings.js'

export const toggleMentionModeCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('toggle mention mode callback')
  const {telegramId} = parseMatch(ctx.match)
  const chat = await getChatByTelegramIdOrThrow(telegramId)
  if (chat.type !== 'group') throw new Error('Chat is not a group')
  await updateChat(chat.id, {onlyMentionMode: !chat.onlyMentionMode})
  await editMessageWithChatSettings(ctx, {...chat, onlyMentionMode: !chat.onlyMentionMode})
}

function parseMatch(match: string | RegExpMatchArray): {
  telegramId: number
} {
  const [, chatId] = match
  return {telegramId: Number(chatId)}
}

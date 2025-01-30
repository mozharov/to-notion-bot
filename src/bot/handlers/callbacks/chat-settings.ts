import type {CallbackQueryMiddleware} from 'grammy'
import type {Context} from 'grammy'
import {editMessageWithChatSettings} from '../../helpers/messages/edit-message-with-chat-settings.js'
import {getChatByTelegramIdOrThrow} from '../../../models/chats.js'

export const chatSettingsCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('chat settings callback')
  const {telegramId} = parseMatch(ctx.match)
  const chat = await getChatByTelegramIdOrThrow(telegramId)
  await editMessageWithChatSettings(ctx, chat)
}

function parseMatch(match: string | RegExpMatchArray) {
  const [, chatId] = match
  return {telegramId: Number(chatId)}
}

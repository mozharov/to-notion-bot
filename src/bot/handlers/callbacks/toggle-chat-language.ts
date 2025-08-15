import type {CallbackQueryMiddleware, Context} from 'grammy'
import {editMessageWithChatSettings} from '../../helpers/messages/edit-message-with-chat-settings.js'
import {getChatByTelegramIdOrThrow, updateChat} from '../../../models/chats.js'

export const toggleChatLanguageCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('change chat language callback')
  const {telegramId} = parseMatch(ctx.match)
  const chat = await getChatByTelegramIdOrThrow(telegramId)
  const languageCode = chat.languageCode === 'en' ? 'ru' : 'en'
  await updateChat(chat.id, {languageCode})
  await ctx.i18n.renegotiateLocale()
  await editMessageWithChatSettings(ctx, {...chat, languageCode})
}

function parseMatch(match: string | RegExpMatchArray): {
  telegramId: number
} {
  const [, chatId] = match
  return {telegramId: Number(chatId)}
}

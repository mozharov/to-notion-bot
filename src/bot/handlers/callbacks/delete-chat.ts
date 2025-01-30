import type {CallbackQueryMiddleware} from 'grammy'
import type {Context} from 'grammy'
import {
  deleteChat,
  getChatByTelegramIdOrThrow,
  getChatsByOwnerTelegramId,
} from '../../../models/chats.js'
import {buildChatsKeyboard} from '../../helpers/keyboards/chats.js'

export const deleteChatCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('delete chat callback')
  const {telegramId} = parseMatch(ctx.match)
  const chat = await getChatByTelegramIdOrThrow(telegramId)
  if (chat.type === 'private') throw new Error('Cannot delete private chat')

  await Promise.all([
    ctx.api.leaveChat(chat.telegramId).catch((error: unknown) => {
      ctx.log.error({error}, 'Failed to leave chat')
    }),
    deleteChat(chat.id),
  ])

  await ctx.answerCallbackQuery(
    ctx.t('chat-settings.deleted', {title: chat.title || chat.telegramId}),
  )

  const chats = await getChatsByOwnerTelegramId(ctx.from.id)
  const keyboard = buildChatsKeyboard(ctx.t, chats)
  return ctx.editMessageText(ctx.t('chats'), {reply_markup: keyboard})
}

function parseMatch(match: string | RegExpMatchArray) {
  const [, chatId] = match
  return {telegramId: Number(chatId)}
}

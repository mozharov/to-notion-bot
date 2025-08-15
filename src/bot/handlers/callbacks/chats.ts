import type {CallbackQueryMiddleware, Context} from 'grammy'
import {getChatsByOwnerTelegramId} from '../../../models/chats.js'
import {buildChatsKeyboard} from '../../helpers/keyboards/chats.js'

export const chatsCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('chats callback')
  const chats = await getChatsByOwnerTelegramId(ctx.from.id)
  const keyboard = buildChatsKeyboard(ctx.t, chats)
  return ctx.editMessageText(ctx.t('chats'), {reply_markup: keyboard})
}

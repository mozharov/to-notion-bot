import type {ChatTypeContext, CommandMiddleware, Context} from 'grammy'
import {getChatsByOwnerTelegramId} from '../../../models/chats.js'
import {buildChatsKeyboard} from '../../helpers/keyboards/chats.js'

export const chatsCommand: CommandMiddleware<ChatTypeContext<Context, 'private'>> = async ctx => {
  ctx.tracker.capture('chats command')
  const chats = await getChatsByOwnerTelegramId(ctx.from.id)
  const keyboard = buildChatsKeyboard(ctx.t, chats)
  return ctx.reply(ctx.t('chats'), {reply_markup: keyboard})
}

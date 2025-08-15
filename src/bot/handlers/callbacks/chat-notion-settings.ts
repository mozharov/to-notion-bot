import type {CallbackQueryMiddleware, Context} from 'grammy'
import {getChatByTelegramIdOrThrow} from '../../../models/chats.js'
import {getOrCreateUser} from '../../../models/users.js'
import {getWorkspacesByOwner} from '../../../models/notion-workspaces.js'
import {buildChatNotionSettingsKeyboard} from '../../helpers/keyboards/chat-notion-settings.js'

export const chatNotionSettingsCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('chat notion settings callback')
  const {telegramId} = parseMatch(ctx.match)

  const chat = await getChatByTelegramIdOrThrow(telegramId)
  const owner = await getOrCreateUser(chat.owner.telegramId)
  const workspaces = await getWorkspacesByOwner(owner.id)

  const title = chat.title ?? chat.telegramId
  const type = chat.type
  await ctx.editMessageText(ctx.t('chat-notion-settings', {title, type}), {
    reply_markup: buildChatNotionSettingsKeyboard(ctx.t, chat, workspaces),
  })
}

function parseMatch(match: string | RegExpMatchArray) {
  const [, chatId] = match
  return {telegramId: Number(chatId)}
}

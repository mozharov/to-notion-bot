import {InlineKeyboard, InputFile, type CallbackQueryMiddleware, type Context} from 'grammy'
import {getChatByTelegramIdOrThrow} from '../../../models/chats.js'
import {getWorkspaceByIdOrThrow} from '../../../models/notion-workspaces.js'
import {setState} from '../../services/session.js'

export const linkToDatabaseCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('link to database callback')
  const {telegramId, workspaceId} = parseMatch(ctx.match)
  await ctx.deleteMessage()
  const chat = await getChatByTelegramIdOrThrow(telegramId)
  const workspace = await getWorkspaceByIdOrThrow(workspaceId)
  const image = `${process.cwd()}/dist/assets/link-to-database.png`
  const cancelKeyboard = new InlineKeyboard().add({
    text: ctx.t('cancel'),
    callback_data: 'cancel',
  })
  await ctx.replyWithPhoto(new InputFile(image), {
    caption: ctx.t('chat-notion-settings.link'),
    reply_markup: cancelKeyboard,
  })
  await setState(ctx.from.id, {
    workspaceId: workspace.id,
    action: 'link-to-database',
    chatId: chat.id,
  })
}

function parseMatch(match: string | RegExpMatchArray) {
  const [, chatId, workspaceId] = match
  if (!workspaceId) throw new Error('Workspace ID is required')
  return {telegramId: Number(chatId), workspaceId}
}

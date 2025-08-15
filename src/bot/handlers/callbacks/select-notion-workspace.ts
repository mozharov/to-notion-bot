import type {CallbackQueryMiddleware, Context} from 'grammy'
import {getChatByTelegramIdOrThrow, updateChat} from '../../../models/chats.js'
import {getWorkspaceByIdOrThrow} from '../../../models/notion-workspaces.js'
import {buildChatNotionWorkspacePagesKeyboard} from '../../helpers/keyboards/chat-notion-workspace-pages.js'
import {NotionClient} from '../../../lib/notion-client.js'

export const selectNotionWorkspaceCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('select notion workspace callback')
  const {telegramId, workspaceId} = parseMatch(ctx.match)

  const chat = await getChatByTelegramIdOrThrow(telegramId)
  const workspace = await getWorkspaceByIdOrThrow(workspaceId)
  await updateChat(chat.id, {notionWorkspaceId: workspace.id})

  const notionService = new NotionClient(workspace.accessToken)
  const databases = await notionService.getDatabases()

  await ctx.editMessageText(ctx.t('chat-notion-settings.pages'), {
    reply_markup: buildChatNotionWorkspacePagesKeyboard(ctx.t, chat, databases, workspace.id),
  })
}

function parseMatch(match: string | RegExpMatchArray) {
  const [, chatId, workspaceId] = match
  if (!workspaceId) throw new Error('Workspace ID is required')
  return {telegramId: Number(chatId), workspaceId}
}

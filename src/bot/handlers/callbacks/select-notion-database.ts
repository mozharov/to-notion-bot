import type {CallbackQueryMiddleware, Context} from 'grammy'
import {getChatByTelegramIdOrThrow, updateChat} from '../../../models/chats.js'
import {NotionClient} from '../../../lib/notion-client.js'
import {editMessageWithChatSettings} from '../../helpers/messages/edit-message-with-chat-settings.js'
import {createNotionDatabase, deleteNotionDatabase} from '../../../models/notion-databases.js'
import {NotFoundDatabaseError} from '../../errors/not-found-database-error.js'

export const selectNotionDatabaseCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('select notion database callback')
  const {telegramId, databaseId} = parseMatch(ctx.match)

  const chat = await getChatByTelegramIdOrThrow(telegramId)
  if (!chat.notionWorkspaceId || !chat.notionWorkspace) {
    throw new Error('Chat has no notion workspace')
  }
  const notionService = new NotionClient(chat.notionWorkspace.accessToken)
  const database = await notionService.getDatabase(databaseId).catch((error: unknown) => {
    if (error instanceof Error && 'status' in error && error.status === 404) {
      throw new NotFoundDatabaseError()
    }
    throw error
  })

  if (chat.notionDatabaseId) await deleteNotionDatabase(chat.notionDatabaseId)
  const notionDatabase = await createNotionDatabase({
    databaseId: database.id,
    title: database.title[0]?.plain_text ?? null,
    notionWorkspaceId: chat.notionWorkspaceId,
  })
  await updateChat(chat.id, {notionDatabaseId: notionDatabase.id})
  await editMessageWithChatSettings(ctx, {
    ...chat,
    notionDatabase,
    notionDatabaseId: notionDatabase.id,
  })
}

function parseMatch(match: string | RegExpMatchArray) {
  const [, chatId, databaseId] = match
  if (!databaseId) throw new Error('Database ID is required')
  return {telegramId: Number(chatId), databaseId}
}

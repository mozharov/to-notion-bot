import {InlineKeyboard, type ChatTypeContext, type Context, type NextFunction} from 'grammy'
import {getChatByIdOrThrow} from '../../../models/chats.js'
import {getWorkspaceByIdOrThrow} from '../../../models/notion-workspaces.js'
import {clearState} from '../../services/session.js'
import {NotionClient} from '../../../lib/notion-client.js'
import {NotFoundDatabaseError} from '../../errors/not-found-database-error.js'

export interface LinkToDatabaseParams {
  workspaceId: string
  chatId: string
}

const LINK_REGEX =
  /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/

const DATABASE_ID_REGEX = /([a-f0-9]{32})/

export async function linkToDatabaseAction(
  ctx: ChatTypeContext<Context, 'private'>,
  {workspaceId, chatId}: LinkToDatabaseParams,
  next: NextFunction,
) {
  ctx.tracker.capture('link to database action')
  const text = ctx.message?.text
  if (!text) {
    await clearState(ctx.from.id)
    await ctx.reply(ctx.t('action-canceled'))
    return next()
  }

  // example: https://www.notion.so/vmozharov/e3067a37f82746a8b337842660b228b1?v=c6f359bf39414cdcb63595836569f69a&pvs=4
  // databaseId = e3067a37f82746a8b337842660b228b1
  const link = text.replace(/[-]/g, '')
  const match = DATABASE_ID_REGEX.exec(link)
  const databaseId = match ? match[0] : null
  if (!LINK_REGEX.test(text) || !databaseId) {
    const cancelKeyboard = new InlineKeyboard().add({
      text: ctx.t('cancel'),
      callback_data: 'cancel',
    })
    await ctx.reply(ctx.t('chat-notion-settings.link-invalid'), {reply_markup: cancelKeyboard})
    return
  }

  const chat = await getChatByIdOrThrow(chatId)
  const workspace = await getWorkspaceByIdOrThrow(workspaceId)

  const notionClient = new NotionClient(workspace.accessToken)
  const database = await notionClient.getDatabase(databaseId).catch((error: unknown) => {
    if (error instanceof Error && 'status' in error && error.status === 404) {
      throw new NotFoundDatabaseError()
    }
    throw error
  })

  const title = database.title[0]?.plain_text

  const keyboard = new InlineKeyboard()
  keyboard.row().add({
    text: ctx.t('chat-notion-settings.add-page'),
    callback_data: `chat:${chat.telegramId}:n-page:${database.id}`,
  })
  keyboard.row().add({
    text: ctx.t('chat-notion-settings.back'),
    callback_data: `chat:${chat.telegramId}:notion`,
  })
  await ctx.reply(
    ctx.t('chat-notion-settings.linked-database', {
      database: title ?? database.id,
    }),
    {reply_markup: keyboard},
  )
}

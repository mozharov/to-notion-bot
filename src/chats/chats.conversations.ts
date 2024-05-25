import {InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {Conversation} from '../conversation/conversation.composer'
import {notionWorkspacesService} from '../notion/notion-workspaces/notion-workspaces.service'
import {NotionService} from '../notion/notion.service'
import {chatsService} from './chats.service'

export async function linkToDatabase(conversation: Conversation, ctx: Context): Promise<void> {
  const update = await conversation.waitForHears(
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
    {
      otherwise: async ctx => {
        await ctx.reply(ctx.t('chat-notion-settings.link-invalid'))
        return conversation.skip({drop: true})
      },
    },
  )

  const text = update.message?.text?.replace(/[-]/g, '')
  if (!text) throw new Error('No text')

  // example: https://www.notion.so/vmozharov/e3067a37f82746a8b337842660b228b1?v=c6f359bf39414cdcb63595836569f69a&pvs=4
  // databaseId = e3067a37f82746a8b337842660b228b1
  const regex = /([a-f0-9]{32})/
  const match = text.match(regex)
  const databaseId = match ? match[0] : null
  if (!databaseId) {
    await ctx.reply(ctx.t('chat-notion-settings.link-invalid'))
    await conversation.skip({drop: true})
    return
  }

  // @ts-expect-error Chat id from conversation
  const chatId: number = ctx._chatId
  // @ts-expect-error Workspace id from conversation
  const workspaceId: string = ctx._workspaceId

  const chat = await chatsService.findChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')

  const workspace = await notionWorkspacesService.getWorkspaceById(workspaceId)
  if (!workspace) throw new Error('Workspace not found')

  const notionService = new NotionService(workspace.accessToken)
  const database = await notionService.getDatabase(databaseId)

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
    {reply_markup: keyboard, parse_mode: 'HTML'},
  )
}

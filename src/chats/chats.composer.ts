import {Composer, InputFile} from 'grammy'
import {Context} from '../context'
import {
  activateChat,
  activatePrivateChat,
  changeChatLanguage,
  deactivateChat,
  deleteChat,
  replyWithChats,
  selectNotionDatabaseForChat,
  selectNotionWorkspaceForChat,
  showChatSettings,
  showChats,
  showNotionSettings,
  toggleSilentMode,
  toggleWatchMode,
  updateGroupStatus,
  updatePrivateChatStatus,
} from './chats.actions'
import {linkToDatabase} from './chats.conversations'
import {createConversation} from '@grammyjs/conversations'
import {chatsService} from './chats.service'
import {notionWorkspacesService} from '../notion/notion-workspaces/notion-workspaces.service'

export const chatsComposer = new Composer<Context>()

chatsComposer.use(createConversation(linkToDatabase))

chatsComposer
  .chatType(['channel', 'group', 'supergroup'])
  .on('my_chat_member:from')
  .use(updateGroupStatus)

const privateChats = chatsComposer.chatType('private')
privateChats.use(activatePrivateChat)
privateChats.on('my_chat_member:from').use(updatePrivateChatStatus)
privateChats.command(['start', 'chats', 'groups', 'channels']).use(replyWithChats)
privateChats.callbackQuery('chats').use(showChats)
privateChats.callbackQuery(/^chat:(-?\d+)$/).use(showChatSettings)
privateChats.callbackQuery(/^chat:(-\d+):delete$/).use(deleteChat)
privateChats.callbackQuery(/^chat:(-?\d+):activate$/).use(activateChat)
privateChats.callbackQuery(/^chat:(-?\d+):deactivate$/).use(deactivateChat)
privateChats.callbackQuery(/^chat:(-?\d+):language$/).use(changeChatLanguage)
privateChats.callbackQuery(/^chat:(-?\d+):notion$/).use(showNotionSettings)
privateChats
  .callbackQuery(
    /^chat:(-?\d+):notion:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  )
  .use(selectNotionWorkspaceForChat)
privateChats
  .callbackQuery(
    /^chat:(-?\d+):n-page:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  )
  .use(selectNotionDatabaseForChat)
privateChats.callbackQuery(/^chat:(-\d+):watch-mode$/).use(toggleWatchMode)
privateChats.callbackQuery(/^chat:(-?\d+):silent-mode$/).use(toggleSilentMode)

privateChats
  .callbackQuery(
    /^chat:(-?\d+):link:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  )
  .use(async ctx => {
    const chatId = Number(ctx.callbackQuery.data.split(':')[1])
    const chat = await chatsService.findChatByTelegramId(chatId)
    if (!chat) throw new Error('Chat not found')

    const workspaceId = String(ctx.callbackQuery.data.split(':')[3])
    const workspace = await notionWorkspacesService.getWorkspaceById(workspaceId)
    if (!workspace) throw new Error('Workspace not found')

    const image = `${process.cwd()}/dist/assets/link-to-database.png`
    await ctx.deleteMessage()
    await ctx.replyWithPhoto(new InputFile(image), {
      caption: ctx.t('chat-notion-settings.link'),
    })
    // @ts-expect-error Set context for conversation
    ctx._chatId = chat.telegramId
    // @ts-expect-error Set context for conversation
    ctx._workspaceId = workspace.id
    await ctx.conversation.enter(linkToDatabase.name, {overwrite: true})
  })

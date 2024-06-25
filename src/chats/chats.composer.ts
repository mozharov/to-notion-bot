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
import {analytics} from '../analytics/analytics.service'

export const chatsComposer = new Composer<Context>()

chatsComposer.use(createConversation(linkToDatabase))

chatsComposer
  .chatType(['channel', 'group', 'supergroup'])
  .on('my_chat_member:from')
  .use(updateGroupStatus)

const privateChats = chatsComposer.chatType('private')
privateChats.use(activatePrivateChat)
privateChats.on('my_chat_member:from').use(updatePrivateChatStatus)
privateChats.command(['start', 'chats', 'groups', 'channels']).use(ctx => {
  analytics.track('chats command', ctx.from.id)
  return replyWithChats(ctx)
})
privateChats.callbackQuery('chats').use(ctx => {
  analytics.track('chats callback', ctx.from.id)
  return showChats(ctx)
})
privateChats.callbackQuery(/^chat:(-?\d+)$/).use(ctx => {
  analytics.track('chat settings callback', ctx.from.id)
  return showChatSettings(ctx)
})
privateChats.callbackQuery(/^chat:(-\d+):delete$/).use(ctx => {
  analytics.track('delete chat callback', ctx.from.id)
  return deleteChat(ctx)
})
privateChats.callbackQuery(/^chat:(-?\d+):activate$/).use(ctx => {
  analytics.track('activate chat callback', ctx.from.id)
  return activateChat(ctx)
})
privateChats.callbackQuery(/^chat:(-?\d+):deactivate$/).use(ctx => {
  analytics.track('deactivate chat callback', ctx.from.id)
  return deactivateChat(ctx)
})
privateChats.callbackQuery(/^chat:(-?\d+):language$/).use(ctx => {
  analytics.track('change chat language callback', ctx.from.id)
  return changeChatLanguage(ctx)
})
privateChats.callbackQuery(/^chat:(-?\d+):notion$/).use(ctx => {
  analytics.track('notion chat settings callback', ctx.from.id)
  return showNotionSettings(ctx)
})
privateChats
  .callbackQuery(
    /^chat:(-?\d+):notion:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  )
  .use(ctx => {
    analytics.track('notion workspace chat callback', ctx.from.id)
    return selectNotionWorkspaceForChat(ctx)
  })
privateChats
  .callbackQuery(
    /^chat:(-?\d+):n-page:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  )
  .use(ctx => {
    analytics.track('notion database chat callback', ctx.from.id)
    return selectNotionDatabaseForChat(ctx)
  })
privateChats.callbackQuery(/^chat:(-\d+):watch-mode$/).use(ctx => {
  analytics.track('watch mode callback', ctx.from.id)
  return toggleWatchMode(ctx)
})
privateChats.callbackQuery(/^chat:(-?\d+):silent-mode$/).use(ctx => {
  analytics.track('silent mode callback', ctx.from.id)
  return toggleSilentMode(ctx)
})

privateChats
  .callbackQuery(
    /^chat:(-?\d+):link:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  )
  .use(async ctx => {
    analytics.track('link to database callback', ctx.from.id)
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

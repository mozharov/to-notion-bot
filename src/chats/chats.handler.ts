import {CallbackQueryContext, ChatTypeContext, NextFunction} from 'grammy'
import {Context} from '../context'
import {ChatsService} from './chats.service'
import {UsersService} from '../users/users.service'
import {LoggerService} from '../logger/logger.service'
import {ChatMemberUpdated} from 'grammy/types'
import {
  getChatNotionSettingsKeyboard,
  getChatNotionWorkspacePagesKeyboard,
  getKeyboardWithChats,
  getSettingsChatKeyboard,
} from './chats.helper'
import {translate} from '../i18n/i18n.helper'
import {NotionWorkspacesService} from '../notion/notion-workspaces/notion-workspaces.service'
import {NotionService} from '../notion/notion.service'
import {NotionDatabasesService} from '../notion/notion-databases/notion-databases.service'

export async function activatePrivateChat(
  ctx: ChatTypeContext<Context, 'private'>,
  next: NextFunction,
): Promise<void> {
  const userId = ctx.chat.id
  const chatsService = new ChatsService()
  const usersService = new UsersService()
  const user = await usersService.getOrCreateUser(userId)
  const chat = await chatsService.getChatByTelegramId(userId)
  if (!chat) {
    const languageCode = ctx.from.language_code === 'ru' ? 'ru' : 'en'
    await chatsService.createChat({
      languageCode,
      telegramId: userId,
      owner: user,
      botStatus: 'unblocked',
      type: 'private',
    })
  } else if (chat.botStatus === 'blocked') {
    await chatsService.updateChat({botStatus: 'unblocked', id: chat.id})
  }
  return next()
}

export async function updatePrivateChatStatus(
  ctx: ChatTypeContext<Context, 'private'> & {
    myChatMember: ChatMemberUpdated
  },
): Promise<void> {
  const userId = ctx.myChatMember.chat.id
  const botStatus = ctx.myChatMember.new_chat_member.status

  const chatsService = new ChatsService()
  const chat = await chatsService.getChatByTelegramId(userId)

  const blocked = botStatus === 'kicked' && chat?.botStatus === 'unblocked'
  const unblocked = botStatus === 'member' && chat?.botStatus === 'blocked'

  if (blocked) {
    chat.botStatus = 'blocked'
    await chatsService.updateChat(chat)
  } else if (unblocked) {
    chat.botStatus = 'unblocked'
    await chatsService.updateChat(chat)
  }
}

export async function updateGroupStatus(
  ctx: ChatTypeContext<Context, 'channel' | 'group' | 'supergroup'> & {
    myChatMember: ChatMemberUpdated
  },
): Promise<void> {
  const logger = new LoggerService('ChatsSettings')

  const chatId = ctx.myChatMember.chat.id
  const userId = ctx.myChatMember.from.id
  const botStatus = ctx.myChatMember.new_chat_member.status

  const logSendMessageError = (error: unknown): void => {
    logger.warn({
      message: 'Failed to send message to user',
      error,
      userId,
      chatId,
    })
  }

  const chatsService = new ChatsService()
  const usersService = new UsersService()
  const user = await usersService.getOrCreateUser(userId)
  const chat = await chatsService.getChatByTelegramId(chatId)
  const privateChat = await chatsService.getChatByTelegramId(userId)

  const blocked = botStatus !== 'administrator' && chat?.botStatus === 'unblocked'
  const unblocked = botStatus === 'administrator' && (!chat || chat.botStatus === 'blocked')

  if (blocked) {
    chat.botStatus = 'blocked'
    await chatsService.updateChat(chat)
    if (privateChat) {
      const text = translate('chat-blocked', privateChat.languageCode ?? 'en')
      await ctx.api.sendMessage(userId, text).catch(logSendMessageError)
    }
    return
  }
  if (unblocked) {
    if (!chat) {
      const type = ctx.myChatMember.chat.type === 'channel' ? 'channel' : 'group'
      await chatsService.createChat({
        telegramId: chatId,
        owner: user,
        botStatus: 'unblocked',
        title: ctx.myChatMember.chat.title,
        type,
        languageCode: privateChat?.languageCode,
      })
    } else {
      chat.botStatus = 'unblocked'
      await chatsService.updateChat(chat)
    }
    if (privateChat) {
      const text = translate('chat-unblocked', privateChat.languageCode ?? 'en')
      await ctx.api.sendMessage(userId, text).catch(logSendMessageError)
    }
  }
}

export async function replyWithChats(ctx: ChatTypeContext<Context, 'private'>): Promise<void> {
  const usersService = new UsersService()
  const chatsService = new ChatsService()

  const user = await usersService.getOrCreateUser(ctx.from.id)
  const chats = await chatsService.getChatsByOwner(user)
  await ctx.reply(ctx.t('select-chat'), {reply_markup: getKeyboardWithChats(ctx, chats)})
}

export async function showChats(ctx: CallbackQueryContext<Context>): Promise<void> {
  const usersService = new UsersService()
  const chatsService = new ChatsService()
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const chats = await chatsService.getChatsByOwner(user)
  await ctx.editMessageText(ctx.t('select-chat'), {reply_markup: getKeyboardWithChats(ctx, chats)})
}

export async function showChatSettings(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])

  const chatsService = new ChatsService()
  const chat = await chatsService.getChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat is not found')

  const keyboard = getSettingsChatKeyboard(ctx, chat)
  const status = chat.botStatus === 'blocked' ? chat.botStatus : chat.status
  const title = chat.title || chat.telegramId
  const type = chat.type
  const language = chat.languageCode
  const notion = chat.notionDatabase ? chat.notionDatabase.title ?? '<unknown>' : 'null'
  await ctx.editMessageText(ctx.t('chat-settings', {title, status, type, language, notion}), {
    reply_markup: keyboard,
  })
}

export async function deleteChat(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const chatsService = new ChatsService()
  const chat = await chatsService.getChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  if (chat.type === 'private') throw new Error('Cannot delete private chat')
  await chatsService.deleteChat(chat)
  await showChats(ctx)
  await ctx.answerCallbackQuery(
    ctx.t('chat-settings.deleted', {title: chat.title || chat.telegramId}),
  )
  return
}

export async function activateChat(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const chatsService = new ChatsService()
  const chat = await chatsService.getChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  await chatsService.activateChat(chat)
  await showChatSettings(ctx)
  return
}

export async function deactivateChat(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const chatsService = new ChatsService()
  const chat = await chatsService.getChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  await chatsService.deactivateChat(chat)
  await showChatSettings(ctx)
  return
}

export async function changeChatLanguage(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const chatsService = new ChatsService()
  const chat = await chatsService.getChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  const language = chat.languageCode === 'en' ? 'ru' : 'en'
  await chatsService.updateChat({id: chat.id, languageCode: language})
  await ctx.i18n.renegotiateLocale()
  await showChatSettings(ctx)
  return
}

export async function showNotionSettings(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const chatsService = new ChatsService()
  const chat = await chatsService.getChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  const workspacesService = new NotionWorkspacesService()
  const workspaces = await workspacesService.getWorkspacesByOwner(chat.owner)
  await ctx.editMessageText(
    ctx.t('chat-notion-settings', {title: chat.title ?? chat.telegramId, type: chat.type}),
    {reply_markup: getChatNotionSettingsKeyboard(ctx, chat, workspaces)},
  )
  return
}

export async function selectNotionWorkspaceForChat(
  ctx: CallbackQueryContext<Context>,
): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const workspaceId = String(ctx.callbackQuery.data.split(':')[3])
  const chatsService = new ChatsService()
  const chat = await chatsService.getChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  const workspacesService = new NotionWorkspacesService()
  const workspace = await workspacesService.getWorkspaceById(workspaceId)
  if (!workspace) throw new Error('Workspace not found')

  await chatsService.updateChat({id: chat.id, notionWorkspace: workspace})

  const notionService = new NotionService(workspace.secretToken)
  const databases = await notionService.getDatabases()

  await ctx.editMessageText(ctx.t('chat-notion-settings.pages'), {
    reply_markup: getChatNotionWorkspacePagesKeyboard(ctx, chat, databases),
  })
  return
}

export async function selectNotionDatabaseForChat(
  ctx: CallbackQueryContext<Context>,
): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const notionDatabaseId = String(ctx.callbackQuery.data.split(':')[3])
  const chatsService = new ChatsService()
  const chat = await chatsService.getChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  if (!chat.notionWorkspace) throw new Error('Chat has no notion workspace')
  const notionService = new NotionService(chat.notionWorkspace.secretToken)
  const database = await notionService.getDatabase(notionDatabaseId)

  const notionDatabasesService = new NotionDatabasesService()
  const notionDatabase = await notionDatabasesService.createDatabase({
    databaseId: database.id,
    title: database.title[0]?.plain_text ?? null,
    chat,
    notionWorkspace: chat.notionWorkspace,
  })
  await chatsService.updateChat({id: chat.id, notionDatabase})
  await showChatSettings(ctx)
}

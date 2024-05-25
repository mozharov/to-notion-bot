import {CallbackQueryContext, ChatTypeContext, NextFunction} from 'grammy'
import {Context} from '../context'
import {chatsService} from './chats.service'
import {usersService} from '../users/users.service'
import {LoggerService} from '../logger/logger.service'
import {ChatMemberUpdated} from 'grammy/types'
import {
  getChatNotionSettingsKeyboard,
  getChatNotionWorkspacePagesKeyboard,
  getKeyboardWithChats,
  getSettingsChatKeyboard,
} from './chats.helper'
import {translate} from '../i18n/i18n.helper'
import {notionWorkspacesService as workspacesService} from '../notion/notion-workspaces/notion-workspaces.service'
import {NotionService} from '../notion/notion.service'
import {NotionDatabasesService} from '../notion/notion-databases/notion-databases.service'
import {config} from '../config/config.service'
import {Chat} from './entities/chat.entity'

const memberValues = ['member', 'administrator', 'creator']
const logger = new LoggerService('ChatsActions')

export async function activatePrivateChat(
  ctx: ChatTypeContext<Context, 'private'>,
  next: NextFunction,
): Promise<void> {
  const userId = ctx.from.id
  const user = await usersService.getOrCreateUser(userId)
  const chat = await chatsService.findChatByTelegramId(userId)

  const languageCode = ctx.from.language_code === 'ru' ? 'ru' : 'en'

  if (!chat) {
    const chat = new Chat()
    chat.languageCode = languageCode
    chat.owner = user
    chat.telegramId = userId
    chat.botStatus = 'unblocked'
    chat.type = 'private'
    chat.status = 'active'
    await chat.save()
  } else if (chat.botStatus === 'blocked') {
    chat.languageCode = languageCode
    chat.botStatus = 'unblocked'
    await chat.save()
  }
  return next()
}

export async function updatePrivateChatStatus(
  ctx: ChatTypeContext<Context, 'private'> & {
    myChatMember: ChatMemberUpdated
  },
): Promise<void> {
  const isMember = memberValues.includes(ctx.myChatMember.new_chat_member.status)
  const chat = await chatsService.findChatByTelegramId(ctx.myChatMember.chat.id)

  if (!isMember) {
    if (chat?.botStatus === 'unblocked') {
      chat.botStatus = 'blocked'
      await chat.save()
    }
    return
  }

  if (chat) {
    chat.botStatus = 'unblocked'
    await chat.save()
  } else {
    logger.warn('Failed to find chat', {myChatMember: ctx.myChatMember})
  }
}

export async function updateGroupStatus(
  ctx: ChatTypeContext<Context, 'channel' | 'group' | 'supergroup'> & {
    myChatMember: ChatMemberUpdated
  },
): Promise<void> {
  const isBotMember = memberValues.includes(ctx.myChatMember.new_chat_member.status)
  const groupChat = await chatsService.findChatByTelegramId(ctx.myChatMember.chat.id)
  const fromUserChat = await chatsService.findChatByTelegramId(ctx.myChatMember.from.id)

  const logSendMessageError = (error: unknown): void => {
    logger.warn('Failed to send message to user', {
      error,
      myChatMember: ctx.myChatMember,
    })
  }

  if (!isBotMember) {
    if (groupChat?.unblocked) {
      groupChat.blocked = true
      await groupChat.save()

      const ownerChat = await chatsService.findChatByTelegramId(groupChat.owner.telegramId)
      if (ownerChat?.unblocked) {
        const text = translate('chat-blocked', ownerChat.languageCode, {
          title: groupChat.title ?? groupChat.telegramId,
        })
        await ctx.api
          .sendMessage(ownerChat.telegramId, text, {parse_mode: 'Markdown'})
          .catch(logSendMessageError)
      }
    }
    return
  }

  if (!fromUserChat) {
    logger.warn('Failed to find from user chat', {myChatMember: ctx.myChatMember})
    return
  }

  if (!groupChat) {
    const type = ctx.myChatMember.chat.type === 'channel' ? 'channel' : 'group'
    const countChats = await chatsService.countChatsByOwner(fromUserChat.owner)
    if (countChats >= config.get('MAX_CHATS_PER_USER') && fromUserChat.unblocked) {
      const text = translate('max-chats-reached', fromUserChat.languageCode)
      await ctx.api
        .sendMessage(fromUserChat.telegramId, text, {parse_mode: 'Markdown'})
        .catch(logSendMessageError)
      return
    }

    const groupChat = new Chat()
    groupChat.owner = fromUserChat.owner
    groupChat.telegramId = ctx.myChatMember.chat.id
    groupChat.botStatus = 'unblocked'
    groupChat.status = 'active'
    groupChat.title = ctx.myChatMember.chat.title
    groupChat.type = type
    groupChat.languageCode = fromUserChat.languageCode
    groupChat.silentMode = true
    await groupChat.save()
  } else {
    groupChat.owner = fromUserChat.owner
    groupChat.title = ctx.myChatMember.chat.title
    groupChat.botStatus = 'unblocked'
    groupChat.status = 'active'
    groupChat.silentMode = true
    await groupChat.save()
  }

  if (fromUserChat.blocked) return
  const text = translate('chat-unblocked', fromUserChat.languageCode, {
    title: ctx.myChatMember.chat.title,
  })
  await ctx.api
    .sendMessage(fromUserChat.telegramId, text, {parse_mode: 'Markdown'})
    .catch(logSendMessageError)
}

export async function replyWithChats(ctx: ChatTypeContext<Context, 'private'>): Promise<void> {
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const chats = await chatsService.getChatsByOwner(user)
  await ctx.reply(ctx.t('select-chat'), {
    reply_markup: getKeyboardWithChats(ctx, chats),
    parse_mode: 'Markdown',
  })
}

export async function showChats(ctx: CallbackQueryContext<Context>): Promise<void> {
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const chats = await chatsService.getChatsByOwner(user)
  await ctx.editMessageText(ctx.t('select-chat'), {
    reply_markup: getKeyboardWithChats(ctx, chats),
    parse_mode: 'Markdown',
  })
}

export async function showChatSettings(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])

  const chat = await chatsService.findChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat is not found')

  const status = chat.botStatus === 'blocked' ? chat.botStatus : chat.status
  const title = chat.title || chat.telegramId
  const type = chat.type
  const language = chat.languageCode
  const database = chat.notionDatabase
    ? chat.notionWorkspace?.status === 'active'
      ? chat.notionDatabase.title ?? '<unknown>'
      : 'inactive'
    : 'null'
  const keyboard = getSettingsChatKeyboard(ctx, chat, database)
  await ctx.editMessageText(
    ctx.t('chat-settings', {
      title,
      status,
      type,
      language,
      database,
      onlyMentionMode: chat.onlyMentionMode.toString(),
      botUsername: ctx.me.username,
      silentMode: chat.silentMode.toString(),
    }),
    {
      reply_markup: keyboard,
      parse_mode: 'HTML',
    },
  )
}

export async function deleteChat(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const chat = await chatsService.findChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  if (chat.type === 'private') throw new Error('Cannot delete private chat')
  await Promise.all([ctx.api.leaveChat(chat.telegramId).catch(logger.warn), chat.remove()])
  await showChats(ctx)
  await ctx.answerCallbackQuery(
    ctx.t('chat-settings.deleted', {title: chat.title || chat.telegramId}),
  )
  return
}

export async function activateChat(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const chat = await chatsService.findChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  await chatsService.activateChat(chat)
  await showChatSettings(ctx)
  return
}

export async function deactivateChat(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const chat = await chatsService.findChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  await chatsService.deactivateChat(chat)
  await showChatSettings(ctx)
  return
}

export async function changeChatLanguage(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const chat = await chatsService.findChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  const language = chat.languageCode === 'en' ? 'ru' : 'en'
  await chatsService.updateChat({id: chat.id, languageCode: language})
  await ctx.i18n.renegotiateLocale()
  await showChatSettings(ctx)
  return
}

export async function showNotionSettings(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const chat = await chatsService.findChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  const workspaces = await workspacesService.getWorkspacesByOwner(chat.owner)
  await ctx.editMessageText(
    ctx.t('chat-notion-settings', {title: chat.title ?? chat.telegramId, type: chat.type}),
    {reply_markup: getChatNotionSettingsKeyboard(ctx, chat, workspaces), parse_mode: 'Markdown'},
  )
  return
}

export async function selectNotionWorkspaceForChat(
  ctx: CallbackQueryContext<Context>,
): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const workspaceId = String(ctx.callbackQuery.data.split(':')[3])
  const chat = await chatsService.findChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  const workspace = await workspacesService.getWorkspaceById(workspaceId)
  if (!workspace) throw new Error('Workspace not found')
  await chatsService.updateChat({id: chat.id, notionWorkspace: workspace})
  const notionService = new NotionService(workspace.accessToken)
  const databases = await notionService.getDatabases()
  await ctx.editMessageText(ctx.t('chat-notion-settings.pages'), {
    reply_markup: getChatNotionWorkspacePagesKeyboard(ctx, chat, databases, workspace.id),
    parse_mode: 'Markdown',
  })
  return
}

export async function selectNotionDatabaseForChat(
  ctx: CallbackQueryContext<Context>,
): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const notionDatabaseId = String(ctx.callbackQuery.data.split(':')[3])
  const chat = await chatsService.findChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  if (!chat.notionWorkspace) throw new Error('Chat has no notion workspace')
  const notionService = new NotionService(chat.notionWorkspace.accessToken)
  const database = await notionService.getDatabase(notionDatabaseId)

  const notionDatabasesService = new NotionDatabasesService()
  if (chat.notionDatabase) await notionDatabasesService.deleteDatabase(chat.notionDatabase)
  const notionDatabase = await notionDatabasesService.createDatabase({
    databaseId: database.id,
    title: database.title[0]?.plain_text ?? null,
    chat,
    notionWorkspace: chat.notionWorkspace,
  })
  await chatsService.updateChat({id: chat.id, notionDatabase})
  await showChatSettings(ctx)
}

export async function toggleWatchMode(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const chat = await chatsService.findChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  if (chat.type !== 'group') throw new Error('Chat is not a group')
  await chatsService.updateChat({id: chat.id, onlyMentionMode: !chat.onlyMentionMode})
  await showChatSettings(ctx)
}

export async function toggleSilentMode(ctx: CallbackQueryContext<Context>): Promise<void> {
  const chatId = Number(ctx.callbackQuery.data.split(':')[1])
  const chat = await chatsService.findChatByTelegramId(chatId)
  if (!chat) throw new Error('Chat not found')
  await chatsService.updateChat({id: chat.id, silentMode: !chat.silentMode})
  await showChatSettings(ctx)
}

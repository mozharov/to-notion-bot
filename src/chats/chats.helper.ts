import {InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {Chat} from './entities/chat.entity'
import {NotionWorkspace} from '../notion/notion-workspaces/entities/notion-workspace.entity'
import {NotionDatabaseResponse} from '../notion/notion.service'

export function getKeyboardWithChats(ctx: Context, chats: Chat[]): InlineKeyboard {
  const keyboard = new InlineKeyboard()
  for (const chat of chats) {
    const botStatusIcon = chat.botStatus === 'blocked' ? '🚫 ' : null
    const statusIcon =
      chat.status === 'active' && chat.notionDatabase && chat.notionWorkspace?.status === 'active'
        ? '🟢 '
        : '🔴 '
    const title = `${botStatusIcon ?? statusIcon}${chat.title || chat.telegramId}`
    const text = chat.type === 'private' ? ctx.t('select-chat.private-chat') : title
    keyboard.row().add({text, callback_data: `chat:${chat.telegramId}`})
  }
  const addChatLink = `https://t.me/${ctx.me.username}?startgroup=true`
  keyboard.row().add({text: ctx.t('select-chat.add-group'), url: addChatLink})
  return keyboard
}

export function getSettingsChatKeyboard(
  ctx: Context,
  chat: Chat,
  database: string,
): InlineKeyboard {
  const keyboard = new InlineKeyboard()
  if (chat.status === 'active') {
    keyboard.add({
      text: ctx.t('chat-settings.deactivate'),
      callback_data: `chat:${chat.telegramId}:deactivate`,
    })
  } else {
    keyboard.add({
      text: ctx.t('chat-settings.activate'),
      callback_data: `chat:${chat.telegramId}:activate`,
    })
  }

  keyboard.row().add({
    text: ctx.t('chat-settings.language', {language: chat.languageCode}),
    callback_data: `chat:${chat.telegramId}:language`,
  })

  keyboard.row().add({
    text: ctx.t('chat-settings.notion', {database}),
    callback_data: `chat:${chat.telegramId}:notion`,
  })

  if (chat.type === 'group') {
    keyboard.row().add({
      text: ctx.t('chat-settings.watch-mode'),
      callback_data: `chat:${chat.telegramId}:watch-mode`,
    })
  }

  keyboard.row().add({
    text: ctx.t('chat-settings.silent-mode', {silentMode: chat.silentMode.toString()}),
    callback_data: `chat:${chat.telegramId}:silent-mode`,
  })

  if (chat.type !== 'private') {
    keyboard.row().add({
      text: ctx.t('chat-settings.delete'),
      callback_data: `chat:${chat.telegramId}:delete`,
    })
  }

  keyboard.row().add({
    text: ctx.t('chat-settings.back'),
    callback_data: 'chats',
  })

  return keyboard
}

export function getChatNotionSettingsKeyboard(
  ctx: Context,
  chat: Chat,
  workspaces: NotionWorkspace[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard()

  workspaces.forEach(workspace => {
    keyboard.row().add({
      text: workspace.name,
      callback_data: `chat:${chat.telegramId}:notion:${workspace.id}`,
    })
  })

  keyboard
    .row()
    .add({
      text: ctx.t('chat-notion-settings.add'),
      callback_data: `workspaces`,
    })
    .row()
    .add({
      text: ctx.t('chat-notion-settings.back'),
      callback_data: `chat:${chat.telegramId}`,
    })
  return keyboard
}

export function getChatNotionWorkspacePagesKeyboard(
  ctx: Context,
  chat: Chat,
  pages: NotionDatabaseResponse[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard()

  pages.forEach(page => {
    keyboard.row().add({
      text: page.title[0]?.plain_text ?? page.id,
      callback_data: `chat:${chat.telegramId}:n-page:${page.id}`,
    })
  })

  keyboard.row().add({
    text: ctx.t('chat-notion-settings.back'),
    callback_data: `chat:${chat.telegramId}:notion`,
  })
  return keyboard
}

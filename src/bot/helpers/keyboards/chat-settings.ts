import {InlineKeyboard, type Context} from 'grammy'
import type {ExtendedChat} from '../../../models/chats.js'

export function buildChatSettingsKeyboard(t: Context['t'], chat: ExtendedChat) {
  const keyboard = new InlineKeyboard()
  if (chat.status === 'active') {
    keyboard.add({
      text: t('deactivate'),
      callback_data: `chat:${chat.telegramId}:deactivate`,
    })
  } else {
    keyboard.add({
      text: t('activate'),
      callback_data: `chat:${chat.telegramId}:activate`,
    })
  }

  if (chat.type !== 'private') {
    keyboard.row().add({
      text: t('chat-settings.language', {language: chat.languageCode}),
      callback_data: `chat:${chat.telegramId}:language`,
    })
  }

  keyboard.row().add({
    text: t('chat-settings.notion', {database: chat.notionDatabase?.title ?? '<unknown>'}),
    callback_data: `chat:${chat.telegramId}:notion`,
  })

  if (chat.type === 'group') {
    keyboard.row().add({
      text: t('chat-settings.mention-mode'),
      callback_data: `chat:${chat.telegramId}:mention-mode`,
    })
  }

  keyboard.row().add({
    text: t('chat-settings.silent-mode', {silentMode: chat.silentMode.toString()}),
    callback_data: `chat:${chat.telegramId}:silent-mode`,
  })

  if (chat.type !== 'private') {
    keyboard.row().add({
      text: t('delete'),
      callback_data: `chat:${chat.telegramId}:delete`,
    })
  }

  keyboard.row().add({
    text: t('back'),
    callback_data: 'chats',
  })

  return keyboard
}

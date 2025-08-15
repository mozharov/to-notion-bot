import type {Context} from 'grammy'
import type {ExtendedChat} from '../../../models/chats.js'
import {bot} from '../../bot.js'

export function buildChatSettingsText(t: Context['t'], chat: ExtendedChat) {
  const database = chat.notionDatabase
    ? chat.notionWorkspace?.status === 'active'
      ? (chat.notionDatabase.title ?? 'unknown')
      : 'inactive'
    : 'null'
  const status = chat.botStatus === 'blocked' ? chat.botStatus : chat.status
  const title = chat.title || chat.telegramId
  const type = chat.type
  const language = chat.languageCode

  return t('chat-settings', {
    title,
    status,
    type,
    language,
    database,
    onlyMentionMode: chat.onlyMentionMode.toString(),
    botUsername: bot.botInfo.username,
    silentMode: chat.silentMode.toString(),
  })
}

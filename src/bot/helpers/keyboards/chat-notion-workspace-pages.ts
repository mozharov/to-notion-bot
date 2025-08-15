import {InlineKeyboard, type Context} from 'grammy'
import type {Chat} from '../../../models/chats.js'
import type {NotionSearchResponse} from '../../../lib/notion-client.js'

export function buildChatNotionWorkspacePagesKeyboard(
  t: Context['t'],
  chat: Chat,
  databases: NotionSearchResponse[],
  workspaceId: string,
) {
  const keyboard = new InlineKeyboard()

  databases.forEach(database => {
    const text = database.title[0]?.plain_text
    if (!text) return
    keyboard.row().add({
      text,
      callback_data: `chat:${chat.telegramId}:n-page:${database.id}`,
    })
  })

  keyboard.row().add({
    text: t('chat-notion-settings.link-to-database'),
    callback_data: `chat:${chat.telegramId}:link:${workspaceId}`,
  })
  keyboard.row().add({
    text: t('back'),
    callback_data: `chat:${chat.telegramId}:notion`,
  })
  return keyboard
}

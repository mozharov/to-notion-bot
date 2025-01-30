import {type Context, InlineKeyboard} from 'grammy'
import type {Chat} from '../../../models/chats.js'
import type {NotionWorkspace} from '../../../models/notion-workspaces.js'
import {buildNotionAuthorizeURI} from '../notion-authorize-uri.js'

export function buildChatNotionSettingsKeyboard(
  t: Context['t'],
  chat: Chat,
  workspaces: NotionWorkspace[],
) {
  const keyboard = new InlineKeyboard()

  workspaces.forEach(workspace => {
    keyboard.row().add({
      text: workspace.name,
      callback_data: `chat:${chat.telegramId}:notion:${workspace.id}`,
    })
  })

  return keyboard
    .row()
    .add({text: t('workspaces.add'), url: buildNotionAuthorizeURI(chat.ownerId)})
    .row()
    .add({
      text: t('back'),
      callback_data: `chat:${chat.telegramId}`,
    })
}

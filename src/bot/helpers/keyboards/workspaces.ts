import {InlineKeyboard} from 'grammy'
import type {Context} from 'grammy'
import type {NotionWorkspace} from '../../../models/notion-workspaces.js'
import type {User} from '../../../models/users.js'
import {buildNotionAuthorizeURI} from '../urls/notion-authorize-uri.js'

export function buildWorkspacesKeyboard(
  t: Context['t'],
  workspaces: NotionWorkspace[],
  userId: User['id'],
) {
  const keyboard = new InlineKeyboard()
  workspaces.forEach(workspace => {
    keyboard.row().add({text: workspace.name, callback_data: `workspace:${workspace.id}`})
  })
  keyboard.row().add({text: t('workspaces.add'), url: buildNotionAuthorizeURI(userId)})
  return keyboard
}

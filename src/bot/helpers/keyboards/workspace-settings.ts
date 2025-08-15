import {InlineKeyboard, type Context} from 'grammy'
import type {NotionWorkspace} from '../../../models/notion-workspaces.js'

export function buildWorkspaceSettingsKeyboard(t: Context['t'], workspace: NotionWorkspace) {
  return new InlineKeyboard()
    .add({
      text: t('delete'),
      callback_data: `workspace:${workspace.id}:delete`,
    })
    .row()
    .add({
      text: t('back'),
      callback_data: `workspaces`,
    })
}

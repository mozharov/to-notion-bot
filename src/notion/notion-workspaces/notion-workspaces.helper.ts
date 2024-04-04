import {InlineKeyboard} from 'grammy'
import {Context} from '../../context'
import {NotionWorkspace} from './entities/notion-workspace.entity'

export function getKeyboardWithWorkspaces(
  ctx: Context,
  workspaces: NotionWorkspace[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard()
  workspaces.forEach(workspace => {
    keyboard.row().add({text: workspace.name, callback_data: `workspace:${workspace.id}`})
  })
  keyboard.row().add({text: ctx.t('workspaces.add'), url: 'test.test'})
  return keyboard
}

export function getWorkspaceSettingsKeyboard(
  ctx: Context,
  workspace: NotionWorkspace,
): InlineKeyboard {
  return new InlineKeyboard()
    .add({
      text: ctx.t('workspace-settings.delete'),
      callback_data: `workspace:${workspace.id}:delete`,
    })
    .row()
    .add({
      text: ctx.t('workspace-settings.back'),
      callback_data: `workspaces`,
    })
}

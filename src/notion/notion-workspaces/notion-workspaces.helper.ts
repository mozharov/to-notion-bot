import {InlineKeyboard} from 'grammy'
import {Context} from '../../context'
import {NotionWorkspace} from './entities/notion-workspace.entity'
import {config} from '../../config/config.service'
import {User} from '../../users/entities/user.entity'

export function getKeyboardWithWorkspaces(
  ctx: Context,
  workspaces: NotionWorkspace[],
  user: User,
): InlineKeyboard {
  const keyboard = new InlineKeyboard()
  workspaces.forEach(workspace => {
    keyboard.row().add({text: workspace.name, callback_data: `workspace:${workspace.id}`})
  })
  keyboard.row().add({text: ctx.t('workspaces.add'), url: getAuthorizeURI(user)})
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

export function getAuthorizeURI(user: User): string {
  const clientId = config.get('NOTION_CLIENT_ID')
  const redirectUri =
    config.get('NODE_ENV') === 'development'
      ? `http://localhost:${config.get('PORT')}/notion`
      : `https://${config.get('ORIGIN_DOMAIN')}/notion`
  return `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${redirectUri}&state=${user.id}`
}

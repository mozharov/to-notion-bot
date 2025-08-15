import type {Context} from 'grammy'
import type {CallbackQueryMiddleware} from 'grammy'
import {getWorkspaceByIdOrThrow} from '../../../models/notion-workspaces.js'
import {countChatsByWorkspace} from '../../../models/chats.js'
import {getOrCreateUser} from '../../../models/users.js'
import {buildWorkspaceSettingsKeyboard} from '../../helpers/keyboards/workspace-settings.js'

export const workspaceSettingsCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('workspace settings callback')
  const {workspaceId} = parseMatch(ctx.match)

  const workspace = await getWorkspaceByIdOrThrow(workspaceId)
  const user = await getOrCreateUser(ctx.from.id)
  const chats = await countChatsByWorkspace(workspace.id, user.id)

  await ctx.editMessageText(
    ctx.t('workspace-settings', {name: workspace.name, status: workspace.status, chats}),
    {reply_markup: buildWorkspaceSettingsKeyboard(ctx.t, workspace)},
  )
}

function parseMatch(match: string | RegExpMatchArray) {
  const [, workspaceId] = match
  return {workspaceId: String(workspaceId)}
}

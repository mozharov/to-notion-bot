import type {Context} from 'grammy'
import type {CallbackQueryMiddleware} from 'grammy'
import {
  deleteWorkspace,
  getWorkspaceByIdOrThrow,
  getWorkspacesByOwner,
} from '../../../models/notion-workspaces.js'
import {getOrCreateUser} from '../../../models/users.js'
import {buildWorkspacesKeyboard} from '../../helpers/keyboards/workspaces.js'

export const deleteWorkspaceCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('delete workspace callback')
  const {workspaceId} = parseMatch(ctx.match)

  const workspace = await getWorkspaceByIdOrThrow(workspaceId)

  await deleteWorkspace(workspace.id)
  await ctx.answerCallbackQuery({text: ctx.t('workspace-settings.deleted', {name: workspace.name})})

  const user = await getOrCreateUser(ctx.from.id)
  const workspaces = await getWorkspacesByOwner(user.id)
  const keyboard = buildWorkspacesKeyboard(ctx.t, workspaces, user.id)
  await ctx.editMessageText(ctx.t('workspaces'), {reply_markup: keyboard})
}

function parseMatch(match: string | RegExpMatchArray) {
  const [, workspaceId] = match
  return {workspaceId: String(workspaceId)}
}

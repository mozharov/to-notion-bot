import type {ChatTypeContext, Context} from 'grammy'
import {buildWorkspacesKeyboard} from '../../helpers/keyboards/workspaces.js'
import type {CallbackQueryMiddleware} from 'grammy'
import {getWorkspacesByOwner} from '../../../models/notion-workspaces.js'
import {getOrCreateUser} from '../../../models/users.js'

export const workspacesCallback: CallbackQueryMiddleware<
  ChatTypeContext<Context, 'private'>
> = async ctx => {
  ctx.tracker.capture('workspaces callback')
  const user = await getOrCreateUser(ctx.from.id)
  const workspaces = await getWorkspacesByOwner(user.id)
  const keyboard = buildWorkspacesKeyboard(ctx.t, workspaces, user.id)
  return ctx.editMessageText(ctx.t('workspaces'), {reply_markup: keyboard})
}

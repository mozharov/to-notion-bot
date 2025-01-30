import type {ChatTypeContext, Context, Middleware} from 'grammy'
import {getOrCreateUser} from '../../../models/users.js'
import {getWorkspacesByOwner} from '../../../models/notion-workspaces.js'
import {buildWorkspacesKeyboard} from '../../helpers/keyboards/workspaces.js'

export const workspacesCommand: Middleware<ChatTypeContext<Context, 'private'>> = async ctx => {
  ctx.tracker.capture('workspaces command')
  const user = await getOrCreateUser(ctx.from.id)
  const workspaces = await getWorkspacesByOwner(user.id)
  const keyboard = buildWorkspacesKeyboard(ctx.t, workspaces, user.id)
  await ctx.reply(ctx.t('workspaces'), {reply_markup: keyboard})
}

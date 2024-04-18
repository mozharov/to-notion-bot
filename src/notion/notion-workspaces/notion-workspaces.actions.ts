import {CallbackQueryContext, ChatTypeContext} from 'grammy'
import {usersService} from '../../users/users.service'
import {chatsService} from '../../chats/chats.service'
import {notionWorkspacesService} from './notion-workspaces.service'
import {Context} from '../../context'
import {getKeyboardWithWorkspaces, getWorkspaceSettingsKeyboard} from './notion-workspaces.helper'

export async function replyWithWorkspaces(ctx: ChatTypeContext<Context, 'private'>): Promise<void> {
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const workspaces = await notionWorkspacesService.getWorkspacesByOwner(user)
  await ctx.reply(ctx.t('workspaces'), {
    reply_markup: getKeyboardWithWorkspaces(ctx, workspaces, user),
    parse_mode: 'Markdown',
  })
}

export async function showWorkspaces(ctx: CallbackQueryContext<Context>): Promise<void> {
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const workspaces = await notionWorkspacesService.getWorkspacesByOwner(user)
  await ctx.editMessageText(ctx.t('workspaces'), {
    reply_markup: getKeyboardWithWorkspaces(ctx, workspaces, user),
    parse_mode: 'Markdown',
  })
}

export async function showWorkspaceSettings(ctx: CallbackQueryContext<Context>): Promise<void> {
  const workspaceId = String(ctx.callbackQuery.data.split(':')[1])

  const workspace = await notionWorkspacesService.getWorkspaceById(workspaceId)
  if (!workspace) throw new Error('Workspace not found')

  const user = await usersService.getOrCreateUser(ctx.from.id)
  const chats = await chatsService.countChatsByWorkspace(workspace, user)

  await ctx.editMessageText(
    ctx.t('workspace-settings', {name: workspace.name, status: workspace.status, chats}),
    {reply_markup: getWorkspaceSettingsKeyboard(ctx, workspace), parse_mode: 'HTML'},
  )
}

export async function deleteWorkspace(ctx: CallbackQueryContext<Context>): Promise<void> {
  const workspaceId = String(ctx.callbackQuery.data.split(':')[1])

  const workspace = await notionWorkspacesService.getWorkspaceById(workspaceId)
  if (!workspace) throw new Error('Workspace not found')

  await notionWorkspacesService.deleteWorkspace(workspace)
  await showWorkspaces(ctx)
  await ctx.answerCallbackQuery({text: ctx.t('workspace-settings.deleted', {name: workspace.name})})
}

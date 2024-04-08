import {CallbackQueryContext, ChatTypeContext} from 'grammy'
import {UsersService} from '../../users/users.service'
import {NotionWorkspacesService} from './notion-workspaces.service'
import {Context} from '../../context'
import {getKeyboardWithWorkspaces, getWorkspaceSettingsKeyboard} from './notion-workspaces.helper'
import {ChatsService} from '../../chats/chats.service'

export async function replyWithWorkspaces(ctx: ChatTypeContext<Context, 'private'>): Promise<void> {
  const usersService = new UsersService()
  const notionWorkspacesService = new NotionWorkspacesService()
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const workspaces = await notionWorkspacesService.getWorkspacesByOwner(user)
  await ctx.reply(ctx.t('workspaces'), {
    reply_markup: getKeyboardWithWorkspaces(ctx, workspaces),
    parse_mode: 'Markdown',
  })
}

export async function showWorkspaces(ctx: CallbackQueryContext<Context>): Promise<void> {
  const usersService = new UsersService()
  const notionWorkspacesService = new NotionWorkspacesService()
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const workspaces = await notionWorkspacesService.getWorkspacesByOwner(user)
  await ctx.editMessageText(ctx.t('workspaces'), {
    reply_markup: getKeyboardWithWorkspaces(ctx, workspaces),
    parse_mode: 'Markdown',
  })
}

export async function showWorkspaceSettings(ctx: CallbackQueryContext<Context>): Promise<void> {
  const workspaceId = String(ctx.callbackQuery.data.split(':')[1])
  const notionWorkspacesService = new NotionWorkspacesService()

  const workspace = await notionWorkspacesService.getWorkspaceById(workspaceId)
  if (!workspace) throw new Error('Workspace not found')

  const usersService = new UsersService()
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const chatsServices = new ChatsService()
  const chats = await chatsServices.countChatsByWorkspace(workspace, user)

  await ctx.editMessageText(
    ctx.t('workspace-settings', {name: workspace.name, status: workspace.status, chats}),
    {reply_markup: getWorkspaceSettingsKeyboard(ctx, workspace), parse_mode: 'HTML'},
  )
}

export async function deleteWorkspace(ctx: CallbackQueryContext<Context>): Promise<void> {
  const workspaceId = String(ctx.callbackQuery.data.split(':')[1])
  const notionWorkspacesService = new NotionWorkspacesService()

  const workspace = await notionWorkspacesService.getWorkspaceById(workspaceId)
  if (!workspace) throw new Error('Workspace not found')

  await notionWorkspacesService.deleteWorkspace(workspace)
  await showWorkspaces(ctx)
  await ctx.answerCallbackQuery({text: ctx.t('workspace-settings.deleted', {name: workspace.name})})
}

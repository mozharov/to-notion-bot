import {Composer} from 'grammy'
import {Context} from '../../context'
import {
  deleteWorkspace,
  replyWithWorkspaces,
  showWorkspaceSettings,
  showWorkspaces,
} from './notion-workspaces.actions'
import {analytics} from '../../analytics/analytics.service'

export const notionWorkspacesComposer = new Composer<Context>()

const privateChats = notionWorkspacesComposer.chatType('private')
privateChats.command('workspaces').use(ctx => {
  analytics.track('workspaces command', ctx.from.id)
  return replyWithWorkspaces(ctx)
})
privateChats.callbackQuery('workspaces').use(ctx => {
  analytics.track('workspaces callback', ctx.from.id)
  return showWorkspaces(ctx)
})
privateChats
  .callbackQuery(
    /^workspace:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  )
  .use(ctx => {
    analytics.track('workspace settings callback', ctx.from.id)
    return showWorkspaceSettings(ctx)
  })
privateChats
  .callbackQuery(
    /^workspace:[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}:delete$/,
  )
  .use(ctx => {
    analytics.track('delete workspace callback', ctx.from.id)
    return deleteWorkspace(ctx)
  })

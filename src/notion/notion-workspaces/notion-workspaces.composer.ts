import {Composer} from 'grammy'
import {Context} from '../../context'
import {
  deleteWorkspace,
  replyWithWorkspaces,
  showWorkspaceSettings,
  showWorkspaces,
} from './notion-workspaces.handler'

export const notionWorkspacesComposer = new Composer<Context>()
// TODO: сделать бэкенд с интеграцией публичной и реализовать механику добавления интеграций, учесть лимит в 90 интеграций с Notion на аккаунт
const privateChats = notionWorkspacesComposer.chatType('private')
privateChats.command('workspaces').use(replyWithWorkspaces)
privateChats.callbackQuery('workspaces').use(showWorkspaces)
privateChats
  .callbackQuery(
    /^workspace:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  )
  .use(showWorkspaceSettings)
privateChats
  .callbackQuery(
    /^workspace:[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}:delete$/,
  )
  .use(deleteWorkspace)

import {Composer} from 'grammy'
import {startCommand} from '../handlers/commands/start.js'
import {helpCommand} from '../handlers/commands/help.js'
import {getChatByTelegramIdOrThrow, updateChat} from '../../models/chats.js'
import {activatePrivateChat} from '../middlewares/activate-private-chat.js'
import {chatsCommand} from '../handlers/commands/chats.js'
import {chatsCallback} from '../handlers/callbacks/chats.js'
import {unknownCallback} from '../handlers/callbacks/unknown.js'
import {chatSettingsCallback} from '../handlers/callbacks/chat-settings.js'
import {deleteChatCallback} from '../handlers/callbacks/delete-chat.js'
import {activateChatCallback} from '../handlers/callbacks/activate-chat.js'
import {toggleChatLanguageCallback} from '../handlers/callbacks/toggle-chat-language.js'
import {toggleMentionModeCallback} from '../handlers/callbacks/toggle-mention-mode.js'
import {toggleSilentModeCallback} from '../handlers/callbacks/toggle-silent-mode.js'
import {chatNotionSettingsCallback} from '../handlers/callbacks/chat-notion-settings.js'
import {selectNotionWorkspaceCallback} from '../handlers/callbacks/select-notion-workspace.js'
import {selectNotionDatabaseCallback} from '../handlers/callbacks/select-notion-database.js'
import {linkToDatabaseCallback} from '../handlers/callbacks/link-to-database.js'
import {handleStateActions} from '../middlewares/handle-state-actions.js'
import {cancelCallback} from '../handlers/callbacks/cancel.js'
import {workspacesCommand} from '../handlers/commands/workspaces.js'
import {workspacesCallback} from '../handlers/callbacks/workspaces.js'
import {workspaceSettingsCallback} from '../handlers/callbacks/workspace-settings.js'
import {deleteWorkspaceCallback} from '../handlers/callbacks/delete-workspace.js'
import {subscriptionCommand} from '../handlers/commands/subscription.js'
import {payTelegramStarsCallback} from '../handlers/callbacks/pay-telegram-stars.js'

export const privateChats = new Composer()
const composer = privateChats.chatType('private')
composer.callbackQuery('cancel', cancelCallback)
composer.use(handleStateActions)
composer.use(activatePrivateChat)

composer.on('my_chat_member:from').use(async ctx => {
  const isMember = ctx.myChatMember.new_chat_member.status === 'member'
  const chat = await getChatByTelegramIdOrThrow(ctx.myChatMember.chat.id)

  const newStatus = isMember ? 'unblocked' : 'blocked'
  ctx.tracker.capture(`user ${newStatus} bot`)
  if (chat.botStatus !== newStatus) await updateChat(chat.id, {botStatus: newStatus})
})

composer.command('start', startCommand)
composer.command('subscription', subscriptionCommand)
composer.command('help', helpCommand)
composer.command('chats', chatsCommand)
composer.command('workspaces', workspacesCommand)

composer.callbackQuery('workspaces', workspacesCallback)
composer.callbackQuery(
  /^workspace:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  workspaceSettingsCallback,
)
composer.callbackQuery(
  /^workspace:[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}:delete$/,
  deleteWorkspaceCallback,
)
composer.callbackQuery('chats', chatsCallback)
composer.callbackQuery(/^chat:(-?\d+)$/, chatSettingsCallback)
composer.callbackQuery(/^chat:(-\d+):delete$/, deleteChatCallback)
composer.callbackQuery(/^chat:(-?\d+):(activate|deactivate)$/, activateChatCallback)
composer.callbackQuery(/^chat:(-?\d+):language$/, toggleChatLanguageCallback)
composer.callbackQuery(/^chat:(-\d+):mention-mode$/, toggleMentionModeCallback)
composer.callbackQuery(/^chat:(-?\d+):silent-mode$/, toggleSilentModeCallback)
composer.callbackQuery(/^chat:(-?\d+):notion$/, chatNotionSettingsCallback)
composer.callbackQuery(
  /^chat:(-?\d+):notion:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  selectNotionWorkspaceCallback,
)
composer.callbackQuery(
  /^chat:(-?\d+):n-page:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  selectNotionDatabaseCallback,
)
composer.callbackQuery(
  /^chat:(-?\d+):link:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  linkToDatabaseCallback,
)
composer.callbackQuery('pay-telegram-stars', payTelegramStarsCallback)

composer.on('callback_query', unknownCallback)

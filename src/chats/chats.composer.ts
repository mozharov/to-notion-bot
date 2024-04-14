import {Composer} from 'grammy'
import {Context} from '../context'
import {
  activateChat,
  activatePrivateChat,
  changeChatLanguage,
  deactivateChat,
  deleteChat,
  replyWithChats,
  selectNotionDatabaseForChat,
  selectNotionWorkspaceForChat,
  showChatSettings,
  showChats,
  showNotionSettings,
  toggleSilentMode,
  toggleWatchMode,
  updateGroupStatus,
  updatePrivateChatStatus,
} from './chats.actions'

export const chatsComposer = new Composer<Context>()

chatsComposer
  .chatType(['channel', 'group', 'supergroup'])
  .on('my_chat_member:from')
  .use(updateGroupStatus)

const privateChats = chatsComposer.chatType('private')
privateChats.use(activatePrivateChat)
privateChats.on('my_chat_member:from').use(updatePrivateChatStatus)
privateChats.command(['start', 'chats', 'groups', 'channels']).use(replyWithChats)
privateChats.callbackQuery('chats').use(showChats)
privateChats.callbackQuery(/^chat:(-?\d+)$/).use(showChatSettings)
privateChats.callbackQuery(/^chat:(-\d+):delete$/).use(deleteChat)
privateChats.callbackQuery(/^chat:(-?\d+):activate$/).use(activateChat)
privateChats.callbackQuery(/^chat:(-?\d+):deactivate$/).use(deactivateChat)
privateChats.callbackQuery(/^chat:(-?\d+):language$/).use(changeChatLanguage)
privateChats.callbackQuery(/^chat:(-?\d+):notion$/).use(showNotionSettings)
privateChats
  .callbackQuery(
    /^chat:(-?\d+):notion:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  )
  .use(selectNotionWorkspaceForChat)
privateChats
  .callbackQuery(
    /^chat:(-?\d+):n-page:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  )
  .use(selectNotionDatabaseForChat)
privateChats.callbackQuery(/^chat:(-\d+):watch-mode$/).use(toggleWatchMode)
privateChats.callbackQuery(/^chat:(-?\d+):silent-mode$/).use(toggleSilentMode)

import {Composer} from 'grammy'
import {Context} from '../context'
import {createConversation} from '@grammyjs/conversations'
import {selectChat} from './chats.conversations'
import {activatePrivateChat, updateGroupStatus, updatePrivateChatStatus} from './chats.handlers'

export const chatsComposer = new Composer<Context>()

chatsComposer.chatType('private').use(createConversation(selectChat))
chatsComposer
  .chatType('private')
  .use(activatePrivateChat)
  .on('my_chat_member:from')
  .use(updatePrivateChatStatus)
chatsComposer
  .chatType(['channel', 'group', 'supergroup'])
  .on('my_chat_member:from')
  .use(updateGroupStatus)
chatsComposer.command('start', ctx => ctx.conversation.enter('selectChat'))

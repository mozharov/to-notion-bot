import {Composer} from 'grammy'
import {Context} from '../context'
import {createConversation} from '@grammyjs/conversations'
import {selectChat} from './chats.conversations'
import {activatePrivateChat, updateGroupStatus, updatePrivateChatStatus} from './chats.handler'

export const chatsComposer = new Composer<Context>()

chatsComposer
  .chatType('private')
  .use(activatePrivateChat)
  .use(createConversation(selectChat))
  .on('my_chat_member:from')
  .use(updatePrivateChatStatus)

chatsComposer
  .chatType(['channel', 'group', 'supergroup'])
  .on('my_chat_member:from')
  .use(updateGroupStatus)

chatsComposer.chatType('private').command(['start', 'chats', 'groups', 'channels'], ctx => {
  return ctx.conversation.enter('selectChat', {overwrite: true})
})

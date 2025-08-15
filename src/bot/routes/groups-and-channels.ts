import {Composer} from 'grammy'
import {blockChatAndNotify} from '../services/block-chat-and-notify.js'
import {unblockChatAndNotify} from '../services/unblock-chat-and-notify.js'

export const groupsAndChannels = new Composer()
const composer = groupsAndChannels.chatType(['group', 'supergroup', 'channel'])

composer.on('my_chat_member').use(async ctx => {
  const isMember = ['member', 'administrator', 'creator'].includes(
    ctx.myChatMember.new_chat_member.status,
  )

  const tgChat = ctx.myChatMember.chat
  const tgUser = ctx.myChatMember.from

  ctx.tracker.capture(`bot ${isMember ? 'added to' : 'removed from'} chat`, {
    chatId: tgChat.id,
    fromId: tgUser.id,
  })

  if (!isMember) return blockChatAndNotify(tgChat.id)
  return unblockChatAndNotify(tgChat, tgUser)
})

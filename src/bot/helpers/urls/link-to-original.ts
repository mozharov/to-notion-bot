import type {Message} from 'grammy/types'

export function getLinkToOriginal(message: Message): string | null {
  if (message.forward_origin?.type === 'user') {
    const username = message.forward_origin.sender_user.username ?? null
    return username && `https://t.me/${username}`
  }
  if (message.forward_origin?.type === 'channel') {
    const username = message.forward_origin.chat.username ?? null
    return username && `https://t.me/${username}/${message.forward_origin.message_id}`
  }
  if (message.forward_origin?.type === 'chat') {
    if (message.forward_origin.sender_chat.type === 'group') return null
    const username = message.forward_origin.sender_chat.username ?? null
    return username && `https://t.me/${username}`
  }
  return null
}

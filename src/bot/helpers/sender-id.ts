import type {Context} from 'grammy'
import type {Chat} from 'grammy/types'

export function getSenderId(ctx: Context & {chat: Chat}): number {
  return ctx.from?.id ?? ctx.message?.sender_chat?.id ?? ctx.chat.id
}

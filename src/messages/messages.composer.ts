import {Composer} from 'grammy'
import {Context} from '../context'
import {sendTextMessageToNotion} from './messages.actions'
import {Chat, MessageEntity} from 'grammy/types'

export const messageComposer = new Composer<Context>()

messageComposer
  .on(['message:text', 'channel_post:text', 'channel_post:caption', 'message:caption'])
  .use(async ctx => {
    const message = ctx.message ?? ctx.channelPost
    const data: MessageData = {
      id: message.message_id,
      text: message.text ?? message.caption ?? '-',
      entities: message.entities ?? message.caption_entities,
      time: message.date,
      from: message.from?.id ?? message.sender_chat?.id ?? message.chat.id,
      isChannel: ctx.chat?.type === 'channel',
      chat: ctx.chat,
      replyToMessage: message.reply_to_message?.message_id,
    }
    await sendTextMessageToNotion(ctx, data)
  })

export type MessageData = {
  id: number
  text: string
  entities?: MessageEntity[]
  time: number
  from: number
  isChannel: boolean
  chat: Chat
  replyToMessage?: number
}

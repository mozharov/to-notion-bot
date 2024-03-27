import {LessThan} from 'typeorm'
import {Context} from '../context'
import {Conversation} from '../conversation/conversation.composer'
import {UsersService} from '../users/users.service'
import {ChatsService} from './chats.service'
import {getKeyboardWithChats} from './chats.helper'
import {ChatTypeContext} from 'grammy'
import {LoggerService} from '../logger/logger.service'

export async function selectChat(
  conversation: Conversation,
  ctx: ChatTypeContext<Context, 'private'>,
): Promise<void> {
  const usersService = new UsersService()
  const chatsService = new ChatsService()

  const user = await conversation.external(() => {
    return usersService.getOrCreateUserByTelegramId(ctx.from.id)
  })
  const chats = await conversation.external(() => {
    return chatsService.getChatsByCriteria({owner: {id: user.id}, telegramId: LessThan(0)})
  })
  const keyboard = await conversation.external(() => getKeyboardWithChats(ctx, chats))
  await ctx.reply(ctx.t('select-chat'), {reply_markup: keyboard})

  const response = await conversation.waitForCallbackQuery([/^select-chat:(add|private|-?\d+)$/])
  const data = response.match[1]

  if (response.message) {
    await ctx.api.deleteMessage(response.message.chat.id, response.message.message_id)
  }

  if (data === 'add') {
    await response.editMessageText(ctx.t('select-chat.new-chat'), {
      reply_markup: {inline_keyboard: []},
    })
    return
  }

  if (!data) {
    const logger = new LoggerService('SelectChat')
    logger.warn({
      message: 'Data is not defined',
      match: response.match,
    })
    return
  }

  await chatOptions(conversation, ctx, data)
}

async function chatOptions(
  conversation: Conversation,
  ctx: ChatTypeContext<Context, 'private'>,
  chatId: string,
): Promise<void> {
  if (chatId === 'private') {
    return
  }
  // const message = await ctx.reply(ctx.t('select-chat.settings'))
}

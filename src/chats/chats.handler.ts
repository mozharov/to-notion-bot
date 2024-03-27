import {ChatTypeContext, NextFunction} from 'grammy'
import {Context} from '../context'
import {ChatsService} from './chats.service'
import {UsersService} from '../users/users.service'
import {LoggerService} from '../logger/logger.service'
import {ChatMemberUpdated} from 'grammy/types'

export async function activatePrivateChat(
  ctx: ChatTypeContext<Context, 'private'>,
  next: NextFunction,
): Promise<void> {
  const userId = ctx.chat.id
  const chatsService = new ChatsService()
  const usersService = new UsersService()
  const user = await usersService.getOrCreateUser(userId)
  const chat = await chatsService.getChatByTelegramId(userId)
  if (!chat) {
    await chatsService.createChat({
      telegramId: userId,
      owner: user,
      botStatus: 'unblocked',
    })
  } else if (chat.botStatus === 'blocked') {
    await chatsService.updateChat({botStatus: 'unblocked', id: chat.id})
  }
  return next()
}

export async function updatePrivateChatStatus(
  ctx: ChatTypeContext<Context, 'private'> & {
    myChatMember: ChatMemberUpdated
  },
): Promise<void> {
  const userId = ctx.myChatMember.chat.id
  const botStatus = ctx.myChatMember.new_chat_member.status

  const chatsService = new ChatsService()
  const chat = await chatsService.getChatByTelegramId(userId)

  const blocked = botStatus === 'kicked' && chat?.botStatus === 'unblocked'
  const unblocked = botStatus === 'member' && chat?.botStatus === 'blocked'

  if (blocked) {
    chat.botStatus = 'blocked'
    await chatsService.updateChat(chat)
  } else if (unblocked) {
    chat.botStatus = 'unblocked'
    await chatsService.updateChat(chat)
  }
}

export async function updateGroupStatus(
  ctx: ChatTypeContext<Context, 'channel' | 'group' | 'supergroup'> & {
    myChatMember: ChatMemberUpdated
  },
): Promise<void> {
  const logger = new LoggerService('ChatsSettings')

  const chatId = ctx.myChatMember.chat.id
  const userId = ctx.myChatMember.from.id
  const botStatus = ctx.myChatMember.new_chat_member.status

  const logSendMessageError = (error: unknown): void => {
    logger.warn({
      message: 'Failed to send message to user',
      error,
      userId,
      chatId,
    })
  }

  const chatsService = new ChatsService()
  const usersService = new UsersService()
  const user = await usersService.getOrCreateUser(userId)
  const chat = await chatsService.getChatByTelegramId(chatId)

  const blocked = botStatus !== 'administrator' && chat?.botStatus === 'unblocked'
  const unblocked = botStatus === 'administrator' && (!chat || chat.botStatus === 'blocked')

  if (blocked) {
    chat.botStatus = 'blocked'
    await chatsService.updateChat(chat)
    await ctx.api.sendMessage(userId, ctx.t('chat-blocked')).catch(logSendMessageError)
  } else if (unblocked) {
    if (!chat) {
      await chatsService.createChat({
        telegramId: chatId,
        owner: user,
        botStatus: 'unblocked',
        title: ctx.myChatMember.chat.title,
      })
    } else {
      chat.botStatus = 'unblocked'
      await chatsService.updateChat(chat)
    }
    await ctx.api.sendMessage(userId, ctx.t('chat-unblocked')).catch(logSendMessageError)
  }
}

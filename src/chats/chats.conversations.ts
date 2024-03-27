import {Context} from '../context'
import {Conversation} from '../conversation/conversation.composer'
import {UsersService} from '../users/users.service'
import {ChatsService} from './chats.service'
import {getKeyboardWithChats, getSettingsChatKeyboard} from './chats.helper'
import {CallbackQueryContext, ChatTypeContext, InlineKeyboard} from 'grammy'
import {LoggerService} from '../logger/logger.service'

export async function selectChat(
  conversation: Conversation,
  ctx: ChatTypeContext<Context, 'private'>,
): Promise<void> {
  const usersService = new UsersService()
  const chatsService = new ChatsService()

  const user = await conversation.external(() => usersService.getOrCreateUser(ctx.from.id))
  const chats = await conversation.external(() => chatsService.getChatsByOwner(user))
  const keyboard = getKeyboardWithChats(ctx, chats)
  await ctx.reply(ctx.t('select-chat'), {reply_markup: keyboard})

  const response = await conversation.waitForCallbackQuery([/^select-chat:(add|-?\d+)$/])
  const data = response.match[1]
  if (!data) {
    const logger = new LoggerService('SelectChat')
    logger.warn({message: 'Data is not defined', match: response.match})
    return
  }

  if (data === 'add') {
    const addChatLink = `https://t.me/${ctx.me.username}?startgroup=true`
    const keyboard = new InlineKeyboard().add({text: ctx.t('select-chat.link'), url: addChatLink})
    await response.editMessageText(ctx.t('select-chat.new-chat'), {reply_markup: keyboard})
    return
  }
  const chatId = parseInt(data)
  await chatOptions(conversation, response, chatId)
}

async function chatOptions(
  conversation: Conversation,
  ctx: CallbackQueryContext<Context>,
  chatId: number,
): Promise<void> {
  const chatsService = new ChatsService()
  const chat = await conversation.external(() => chatsService.getChatByTelegramId(chatId))
  if (!chat) throw new Error('Chat is not found')

  const keyboard = getSettingsChatKeyboard(ctx, chat)

  const status = chat.botStatus === 'blocked' ? chat.botStatus : chat.status
  await ctx.editMessageText(
    ctx.t('chat-settings', {title: chat.title || chat.telegramId, status}),
    {reply_markup: keyboard},
  )
}

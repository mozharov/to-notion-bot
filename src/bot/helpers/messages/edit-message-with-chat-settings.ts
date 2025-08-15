import type {Context} from 'grammy'
import {type ExtendedChat} from '../../../models/chats.js'
import {buildChatSettingsKeyboard} from '../keyboards/chat-settings.js'
import {buildChatSettingsText} from '../texts/chat-settings-text.js'

export async function editMessageWithChatSettings(ctx: Context, chat: ExtendedChat) {
  const keyboard = buildChatSettingsKeyboard(ctx.t, chat)
  const text = buildChatSettingsText(ctx.t, chat)
  await ctx.editMessageText(text, {reply_markup: keyboard})
}

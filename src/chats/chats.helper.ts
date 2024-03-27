import {InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {Chat} from './entities/chat.entity'

export function getKeyboardWithChats(ctx: Context, groups: Chat[]): InlineKeyboard {
  const keyboard = new InlineKeyboard()

  for (const group of groups) {
    const botStatusIcon = group.botStatus === 'blocked' ? '🚫 ' : null
    const statusIcon = group.status === 'active' ? '🟢 ' : '🔴 '
    const groupTitle = `${botStatusIcon ?? statusIcon}${group.title || group.telegramId}`
    const text = group.telegramId > 0 ? ctx.t('select-chat.private-chat') : groupTitle
    keyboard.row().add({text, callback_data: `select-chat:${group.telegramId}`})
  }

  keyboard.row().add({
    text: ctx.t('select-chat.add-chat'),
    callback_data: 'select-chat:add',
  })

  return keyboard
}

export function getSettingsChatKeyboard(ctx: Context, chat: Chat): InlineKeyboard {
  const keyboard = new InlineKeyboard()
  if (chat.status === 'active') {
    keyboard.add({
      text: ctx.t('chat-settings.deactivate'),
      callback_data: `settings:${chat.telegramId}:deactivate`,
    })
  } else {
    keyboard.add({
      text: ctx.t('chat-settings.activate'),
      callback_data: `settings:${chat.telegramId}:activate`,
    })
  }
  return keyboard
}

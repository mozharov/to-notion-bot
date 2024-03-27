import {InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {Chat} from './entities/chat.entity'

export async function getKeyboardWithChats(ctx: Context, groups: Chat[]): Promise<InlineKeyboard> {
  const keyboard = new InlineKeyboard()
  keyboard.add({
    text: ctx.t('select-chat.private-chat'),
    callback_data: 'select-chat:private',
  })
  for (const group of groups) {
    keyboard.row().add({
      text: `${group.title || group.telegramId}`,
      callback_data: `select-chat:${group.telegramId}`,
    })
  }
  keyboard.row().add({
    text: ctx.t('select-chat.add-chat'),
    callback_data: 'select-chat:add',
  })
  return keyboard
}

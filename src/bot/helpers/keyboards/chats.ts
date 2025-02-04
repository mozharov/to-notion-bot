import {InlineKeyboard} from 'grammy'
import type {Context} from 'grammy'
import type {ExtendedChat} from '../../../models/chats.js'
import {bot} from '../../bot.js'
import {getLifetimeAccessUrl} from '../urls/lifetime-access.js'
import {isUserHasLifetimeAccess} from '../user.js'

export function buildChatsKeyboard(t: Context['t'], chats: ExtendedChat[]) {
  const keyboard = new InlineKeyboard()

  for (const chat of chats) {
    const isNotionWorkspaceActive = chat.notionWorkspace?.status === 'active'
    const isBotBlocked = chat.botStatus === 'blocked'
    const isActiveChat =
      chat.status === 'active' && chat.notionDatabaseId && isNotionWorkspaceActive

    const chatStatusIcon = isActiveChat ? '🟢' : '🔴'
    const title = `${isBotBlocked ? '🚫' : chatStatusIcon} ${chat.title || chat.telegramId}`
    const text = chat.type === 'private' ? t('chats.private') : title
    keyboard.row().add({text, callback_data: `chat:${chat.telegramId}`})
  }

  keyboard
    .row()
    .add({text: t('chats.add'), url: `https://t.me/${bot.botInfo.username}?startgroup=true`})

  if (chats[0] && !isUserHasLifetimeAccess(chats[0].owner)) {
    keyboard.add({
      text: t('subscription.button'),
      url: getLifetimeAccessUrl(),
    })
  }
  return keyboard
}

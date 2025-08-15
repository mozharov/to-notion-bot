import type {ChatTypeContext, Context, Middleware} from 'grammy'
import {getChatByTelegramId, createChat, updateChat} from '../../models/chats.js'
import {getOrCreateUser} from '../../models/users.js'

export const activatePrivateChat: Middleware<ChatTypeContext<Context, 'private'>> = async (
  ctx,
  next,
) => {
  const chat = await getChatByTelegramId(ctx.from.id)
  const languageCode = ctx.from.language_code === 'ru' ? 'ru' : 'en'

  if (!chat) {
    const user = await getOrCreateUser(ctx.from.id)
    await createChat({
      telegramId: ctx.from.id,
      title: ctx.from.username,
      type: 'private',
      ownerId: user.id,
      languageCode,
      botStatus: 'unblocked',
      onlyMentionMode: false,
      silentMode: false,
      status: 'active',
    })
  } else {
    if (chat.languageCode !== languageCode || chat.botStatus !== 'unblocked') {
      await updateChat(chat.id, {languageCode, botStatus: 'unblocked'})
    }
  }
  return next()
}

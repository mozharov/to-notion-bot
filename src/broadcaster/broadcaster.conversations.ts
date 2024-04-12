import {InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {Conversation} from '../conversation/conversation.composer'

export async function broadcasting(conversation: Conversation, ctx: Context): Promise<void> {
  const languageCode = String(ctx.callbackQuery?.data?.split(':')[1])
  if (languageCode !== 'ru' && languageCode !== 'en') throw new Error('Invalid language code')

  await ctx.editMessageText(ctx.t('broadcast.wait-message', {languageCode}), {parse_mode: 'HTML'})

  const message = await conversation.waitFor('message')
  const chatId = message.chat.id
  const messageId = message.message.message_id
  const broadcastMessage = await ctx.api.copyMessage(chatId, chatId, messageId)

  const keyboard = new InlineKeyboard()
    .add({
      text: ctx.t('broadcast.send'),
      callback_data: `broadcast:${languageCode}:${broadcastMessage.message_id}`,
    })
    .row()
    .add({
      text: ctx.t('broadcast.cancel'),
      callback_data: 'broadcast:cancel',
    })
  await ctx.reply(ctx.t('broadcast.check'), {parse_mode: 'HTML', reply_markup: keyboard})
}

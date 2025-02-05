import {InlineKeyboard, type ChatTypeContext, type Context, type Middleware} from 'grammy'
import {setState} from '../../services/session.js'

export const feedbackCommand: Middleware<ChatTypeContext<Context, 'private'>> = async ctx => {
  const keyboard = new InlineKeyboard().add({callback_data: 'cancel', text: ctx.t('cancel')})
  await setState(ctx.from.id, {action: 'feedback'})
  return ctx.reply(ctx.t('feedback'), {reply_markup: keyboard})
}

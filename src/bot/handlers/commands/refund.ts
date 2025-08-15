import {InlineKeyboard, type ChatTypeContext, type Context, type Middleware} from 'grammy'

export const refundCommand: Middleware<ChatTypeContext<Context, 'private'>> = async ctx => {
  ctx.tracker.capture('refund command')
  const keyboard = new InlineKeyboard()
    .add({
      callback_data: 'refund',
      text: ctx.t('refund.do-it'),
    })
    .add({
      callback_data: 'cancel',
      text: ctx.t('cancel'),
    })
  await ctx.reply(ctx.t('refund'), {reply_markup: keyboard})
}

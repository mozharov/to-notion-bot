import {InlineKeyboard, type Context} from 'grammy'

export function buildSubscriptionKeyboard(t: Context['t']) {
  return new InlineKeyboard().add({
    callback_data: 'pay-telegram-stars',
    text: t('subscription.telegram-stars'),
  })
}

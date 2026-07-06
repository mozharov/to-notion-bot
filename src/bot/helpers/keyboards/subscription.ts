import {InlineKeyboard, type Context} from 'grammy'
import {config} from '../../../config.js'

export function buildSubscriptionKeyboard(t: Context['t']) {
  return new InlineKeyboard()
    .add({
      callback_data: 'pay-telegram-stars:month',
      text: t('subscription.telegram-stars-month', {stars: config.subscriptionMonthlyPriceStars}),
    })
    .row()
    .add({
      callback_data: 'pay-telegram-stars:year',
      text: t('subscription.telegram-stars-year', {stars: config.subscriptionYearlyPriceStars}),
    })
    .row()
    .add({
      callback_data: 'pay-telegram-stars:lifetime',
      text: t('subscription.telegram-stars-lifetime', {
        stars: config.subscriptionLifetimePriceStars,
      }),
    })
}

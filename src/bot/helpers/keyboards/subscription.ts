import {InlineKeyboard, type Context} from 'grammy'
import {tunnelUrl} from '../../../lib/tunnel.js'
import {config} from '../../../config.js'

export function buildSubscriptionKeyboard(t: Context['t'], tgUserId: number) {
  return (
    new InlineKeyboard()
      // .add({
      //   url: `${tunnelUrl ?? `https://${config.HOST}`}/pay-bitcoin?tgUserId=${tgUserId}`, // tunnelUrl for development because Telegram throws error when using localhost
      //   text: t('subscription.bitcoin'),
      // })
      .add({
        callback_data: 'pay-telegram-stars',
        text: t('subscription.telegram-stars'),
      })
  )
}

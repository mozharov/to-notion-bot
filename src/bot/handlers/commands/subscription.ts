import {InlineKeyboard, type ChatTypeContext, type Context, type Middleware} from 'grammy'
import {config} from '../../../config.js'
import {tunnelUrl} from '../../../lib/tunnel.js'
import {isUserHasLifetimeAccess} from '../../helpers/user.js'
import {getOrCreateUser} from '../../../models/users.js'

export const subscriptionCommand: Middleware<ChatTypeContext<Context, 'private'>> = async ctx => {
  ctx.tracker.capture('subscription command')

  const user = await getOrCreateUser(ctx.from.id)
  if (isUserHasLifetimeAccess(user)) {
    await ctx.reply(ctx.t('subscription.already-has'))
    return
  }

  const keyboard = new InlineKeyboard()
    .add({
      url: `${tunnelUrl ?? `https://${config.HOST}`}/pay-bitcoin?tgUserId=${ctx.from.id}`, // tunnelUrl for development because Telegram throws error when using localhost
      text: ctx.t('subscription.bitcoin'),
    })
    .add({
      callback_data: 'pay-telegram-stars',
      text: ctx.t('subscription.telegram-stars'),
    })
  await ctx.reply(ctx.t('subscription'), {
    reply_markup: keyboard,
  })
}

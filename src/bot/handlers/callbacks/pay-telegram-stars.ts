import {CallbackQueryMiddleware, type Context} from 'grammy'
import {getOrCreateUser} from '../../../models/users.js'
import {isUserHasLifetimeAccess} from '../../helpers/user.js'
import {createInvoice} from '../../../models/invoices.js'
import {config} from '../../../config.js'

export const payTelegramStarsCallback: CallbackQueryMiddleware<Context> = async ctx => {
  ctx.tracker.capture('pay telegram stars callback')
  const user = await getOrCreateUser(ctx.from.id)
  if (isUserHasLifetimeAccess(user)) {
    await ctx.reply(ctx.t('subscription.already-has'))
    return
  }

  const amount = config.LIFETIME_ACCESS_TELEGRAM_STARS_PRICE
  const invoice = await createInvoice({
    amount,
    currency: 'XTR',
    userId: user.id,
  })
  await ctx.replyWithInvoice(
    ctx.t('subscription.title'),
    ctx.t('subscription.description'),
    invoice.id,
    'XTR',
    [{amount, label: 'lifetime access'}],
  )
}

import {type ChatTypeContext, type Context, type Middleware} from 'grammy'
import {getUserRefundableInvoice, updateInvoice} from '../../../models/invoices.js'
import {getOrCreateUser, updateUser} from '../../../models/users.js'

export const refundCallback: Middleware<ChatTypeContext<Context, 'private'>> = async ctx => {
  ctx.tracker.capture('refund callback')
  await ctx.deleteMessage()
  const user = await getOrCreateUser(ctx.from.id)
  const invoice = await getUserRefundableInvoice(user.id)
  if (!invoice) {
    await ctx.reply(ctx.t('refund.not-available'))
    return
  }
  ctx.log.info({invoice}, 'Starting refund')

  if (invoice.telegramInvoiceId) {
    await ctx.api.refundStarPayment(user.telegramId, invoice.telegramInvoiceId)
    await updateInvoice(invoice.id, {status: 'refunded'})
    await ctx.reply(ctx.t('refund.telegram'))
    ctx.log.info('Refunded telegram invoice')
  } else throw new Error('No invoice id')

  await updateUser(user.id, {subscriptionEndsAt: null, leftMessages: 0})
}

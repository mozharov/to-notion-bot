import {Middleware, type Context} from 'grammy'
import type {SuccessfulPayment} from 'grammy/types'
import {getInvoiceOrThrow, updateInvoice} from '../../models/invoices.js'
import {updateUser} from '../../models/users.js'
import {extendSubscriptionEndDate} from '../helpers/subscription.js'

export const successfulPayment: Middleware<
  Context & {message: {successful_payment: SuccessfulPayment}}
> = async ctx => {
  const tgPayment = ctx.message.successful_payment
  const invoice = await getInvoiceOrThrow({id: tgPayment.invoice_payload})
  if (!invoice.period) throw new Error('Invoice has no period')
  ctx.tracker.capture('successful payment', {plan: invoice.period})

  const subscriptionEndsAt =
    invoice.period === 'lifetime'
      ? null
      : extendSubscriptionEndDate(invoice.user.subscriptionEndsAt, invoice.period)

  await updateUser(invoice.userId, {
    subscriptionEndsAt,
    leftMessages: -1,
  })
  await updateInvoice(invoice.id, {
    status: 'settled',
    telegramInvoiceId: tgPayment.telegram_payment_charge_id,
    settledAt: new Date(),
  })
  await ctx.reply(ctx.t('subscription.invoice-settled'))
}

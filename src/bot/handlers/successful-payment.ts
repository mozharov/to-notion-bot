import {Middleware, type Context} from 'grammy'
import type {SuccessfulPayment} from 'grammy/types'
import {getInvoiceOrThrow, updateInvoice} from '../../models/invoices.js'
import {updateUser} from '../../models/users.js'

export const successfulPayment: Middleware<
  Context & {message: {successful_payment: SuccessfulPayment}}
> = async ctx => {
  ctx.tracker.capture('successful payment')
  const tgPayment = ctx.message.successful_payment
  const invoice = await getInvoiceOrThrow({id: tgPayment.invoice_payload})
  await updateUser(invoice.userId, {
    subscriptionEndsAt: null,
    leftMessages: -1,
  })
  await updateInvoice(invoice.id, {
    status: 'settled',
    telegramInvoiceId: tgPayment.telegram_payment_charge_id,
    settledAt: new Date(),
  })
  await ctx.reply(ctx.t('subscription.invoice-settled'))
}

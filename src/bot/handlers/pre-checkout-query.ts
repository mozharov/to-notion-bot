import {Middleware} from 'grammy'
import {getInvoiceOrThrow} from '../../models/invoices.js'

export const preCheckoutQuery: Middleware = async ctx => {
  ctx.tracker.capture('pre checkout query')
  if (!ctx.preCheckoutQuery) throw new Error('Pre checkout query is not found')
  const invoice = await getInvoiceOrThrow({id: ctx.preCheckoutQuery.invoice_payload})
  if (invoice.status !== 'created') throw new Error('Wrong invoice status')
  await ctx.answerPreCheckoutQuery(true)
}

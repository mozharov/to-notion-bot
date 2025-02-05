import {Middleware} from 'grammy'
import {getInvoice} from '../../models/invoices.js'

export const preCheckoutQuery: Middleware = async ctx => {
  ctx.tracker.capture('pre checkout query')
  if (!ctx.preCheckoutQuery) throw new Error('Pre checkout query is not found')
  const invoiceId = ctx.preCheckoutQuery.invoice_payload
  const invoice = await getInvoice({id: invoiceId})
  if (invoice?.status !== 'created') {
    ctx.log.error({invoiceId}, 'Invoice has wrong status or not found')
    await ctx.answerPreCheckoutQuery(false, 'Invoice has wrong status or not found')
    return
  }
  await ctx.answerPreCheckoutQuery(true)
}

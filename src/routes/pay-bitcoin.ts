import Router from '@koa/router'
import {getUserByTelegramId} from '../models/users.js'
import {createInvoice, updateInvoice} from '../models/invoices.js'
import {config} from '../config.js'
import {btcpay} from '../services/btcpay/btcpay.js'
import {isUserHasLifetimeAccess} from '../bot/helpers/user.js'

export const payBitcoinRouter = new Router()
payBitcoinRouter.get('/pay-bitcoin', async ctx => {
  const {tgUserId} = ctx.query
  if (!tgUserId) return ctx.throw(400, 'tgUserId is required')
  const user = await getUserByTelegramId(Number(tgUserId))
  if (!user) return ctx.throw(400, 'User not found')
  if (isUserHasLifetimeAccess(user)) return ctx.throw(400, 'User already has lifetime access')

  const amount = config.LIFETIME_ACCESS_PRICE
  const invoice = await createInvoice({
    amount,
    userId: user.id,
    currency: 'SATS',
  })
  const btcpayInvoice = await btcpay
    .createInvoice({
      amount: amount.toString(),
      currency: 'SATS',
      metadata: {
        orderId: invoice.id,
        tgUserId: user.telegramId,
      },
    })
    .catch(error => ctx.throw(500, 'Failed to create invoice', error?.response?.body ?? error))

  await updateInvoice(invoice.id, {btcpayInvoiceId: btcpayInvoice.id})
  ctx.redirect(btcpayInvoice.checkoutLink)
})

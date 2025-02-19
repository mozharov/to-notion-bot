import Router from '@koa/router'
import crypto from 'crypto'
import {config} from '../config.js'
import type {Context} from 'koa'
import {updateUser} from '../models/users.js'
import {updateInvoice} from '../models/invoices.js'
import {bot} from '../bot/bot.js'
import {translate} from '../bot/lib/i18n.js'
import {getChatByTelegramIdOrThrow} from '../models/chats.js'
import {Tracker} from '../bot/lib/tracker.js'

export const btcpayRouter = new Router()

// webhook for BTCPay
btcpayRouter.post('/btcpay', async ctx => {
  validateRequest(ctx)
  const body = ctx.request.body as BTCPayWebhookBody
  ctx.log.info({body}, 'BTCPay webhook received')

  const {type, invoiceId, metadata} = body
  const {orderId, tgUserId} = metadata ?? {}
  if (!orderId || !tgUserId) return ctx.throw('Missing orderId or tgUserId in metadata', 400)

  const chat = await getChatByTelegramIdOrThrow(tgUserId)

  if (type === 'InvoiceExpired') {
    ctx.log.info({invoiceId}, 'Invoice expired')
    await updateInvoice(orderId, {status: 'expired'})
  } else if (type === 'InvoiceProcessing') {
    ctx.log.info({invoiceId}, 'Invoice processing')
    await updateInvoice(orderId, {status: 'processing'})
    await updateUser(chat.ownerId, {
      leftMessages: -1,
      subscriptionEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    await bot.api
      .sendMessage(
        chat.telegramId,
        translate('subscription.invoice-processing', chat.languageCode),
        {parse_mode: 'HTML'},
      )
      .catch((error: unknown) => {
        ctx.log.error({error}, 'Error sending message to user')
      })
  } else if (type === 'InvoiceSettled') {
    const tracker = new Tracker(tgUserId.toString())
    tracker.capture('invoice settled')
    ctx.log.info({invoiceId}, 'Invoice settled')
    await updateUser(chat.ownerId, {
      subscriptionEndsAt: null,
      leftMessages: -1,
    })
    await updateInvoice(orderId, {status: 'settled', settledAt: new Date()})
    await bot.api
      .sendMessage(chat.telegramId, translate('subscription.invoice-settled', chat.languageCode), {
        parse_mode: 'HTML',
      })
      .catch((error: unknown) => {
        ctx.log.error({error}, 'Error sending message to user')
      })
  } else if (type === 'InvoiceInvalid') {
    ctx.log.info({invoiceId}, 'Invoice invalid')
    await updateInvoice(orderId, {status: 'invalid'})
  } else return ctx.throw(`Unknown invoice type: ${type}`, 400)

  ctx.body = 'OK'
})

// Only fields used in webhook
interface BTCPayWebhookBody {
  type:
    | 'InvoiceExpired'
    | 'InvoiceProcessing'
    | 'InvoiceSettled'
    | 'InvoiceInvalid'
    | 'InvoiceReceivedPayment'
    | 'InvoicePaymentSettled'
  invoiceId: string
  metadata?: {
    orderId?: string
    tgUserId?: number
  }
}

function validateRequest(ctx: Context) {
  const sigHashAlg = 'sha256'
  const sigHeaderName = 'BTCPAY-SIG'

  if (!ctx.request.rawBody) ctx.throw('Request body empty')

  const checksum = Buffer.from(ctx.get(sigHeaderName) || '', 'utf8')
  const hmac = crypto.createHmac(sigHashAlg, config.BTCPAY_WEBHOOK_SECRET)
  const digest = Buffer.from(
    sigHashAlg + '=' + hmac.update(ctx.request.rawBody).digest('hex'),
    'utf8',
  )

  if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
    ctx.throw(`Request body digest did not match ${sigHeaderName}`)
  }
}

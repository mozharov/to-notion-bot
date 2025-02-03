import Router from '@koa/router'
import crypto from 'crypto'
import {config} from '../config.js'
import type {Context} from 'koa'

export const btcpayRouter = new Router()

// webhook for BTCPay
btcpayRouter.post('/btcpay', async ctx => {
  validateRequest(ctx)
  const body = ctx.request.body as BTCPayWebhookBody
  ctx.log.info({body}, 'BTCPay webhook received')

  const {orderId, tgUserId} = body.metadata ?? {}
  if (!orderId || !tgUserId) return ctx.throw('Missing orderId or tgUserId in metadata')
  const {type, invoiceId} = body

  if (type === 'InvoiceExpired') {
    ctx.log.debug({invoiceId}, 'Invoice expired')
    // TODO: handle expired invoice
  } else if (type === 'InvoiceProcessing') {
    ctx.log.debug({invoiceId}, 'Invoice processing')
    // TODO: handle processing invoice
  } else if (type === 'InvoiceSettled') {
    ctx.log.debug({invoiceId}, 'Invoice settled')
    // TODO: handle settled invoice
  } else if (type === 'InvoiceInvalid') {
    ctx.log.debug({invoiceId}, 'Invoice invalid')
    // TODO: handle invalid invoice
  } else return ctx.throw(`Unknown invoice type: ${type}`)

  ctx.body = 'OK'
})

// Only fields used in webhook
interface BTCPayWebhookBody {
  type: 'InvoiceExpired' | 'InvoiceProcessing' | 'InvoiceSettled' | 'InvoiceInvalid'
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
    ctx.throw(`Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`)
  }
}

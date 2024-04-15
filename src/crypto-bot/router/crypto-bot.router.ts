import {Router, Request} from 'express'
import {LoggerService} from '../../logger/logger.service'
import crypto from 'crypto'
import {config} from '../../config/config.service'
import {paymentsService} from '../../payments/payments.service'

const logger = new LoggerService('WalletRouter')

export const cryptoBotRouter = Router()

cryptoBotRouter.route('/crypto-bot').post(async (req, res) => {
  const isValid = checkSignature(req)
  if (!isValid) {
    logger.warn('Invalid signature')
    res.sendStatus(403)
    return
  }
  const body = req.body as {
    update_id: number
    update_type: 'invoice_paid'
    request_date: string
    payload: {payload?: string; status: 'active' | 'paid' | 'expired'}
  }

  if (body.payload?.payload) {
    const payment = await paymentsService.findById(body.payload.payload)
    if (!payment) {
      logger.error('Payment not found', {body})
      res.sendStatus(200)
      return
    }
    if (body.payload.status === 'paid') {
      payment.status = 'completed'
      await payment.save()
    } else if (body.payload.status === 'expired') {
      payment.status = 'failed'
      await payment.save()
    } else logger.error('Invalid status', {body})
  } else logger.error('Invalid payload', {body})

  res.sendStatus(200)
})

function checkSignature({body, headers}: Request): boolean {
  const secret = crypto
    .createHash('sha256')
    .update(config.get('CRYPTO_BOT_API_KEY') ?? '')
    .digest()
  const checkString = JSON.stringify(body)
  const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex')
  return hmac === headers['crypto-pay-api-signature']
}

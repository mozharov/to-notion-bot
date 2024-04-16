import {Router, Request} from 'express'
import {LoggerService} from '../../logger/logger.service'
import crypto from 'crypto'
import {config} from '../../config/config.service'
import {paymentsService} from '../../payments/payments.service'
import {bot} from '../../bot'
import {subscriptionsService} from '../../subscriptions/subscriptions.service'
import {chatsService} from '../../chats/chats.service'
import {translate} from '../../i18n/i18n.helper'

const logger = new LoggerService('WalletRouter')

export const cryptoBotRouter = Router()

cryptoBotRouter.route('/crypto-bot').post(async (req, res) => {
  logger.debug('Crypto bot request')
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
      const days = payment.plan.name === 'month' ? 30 : 360
      payment.status = 'completed'
      await payment.save()
      await subscriptionsService.giveDaysToUser(payment.user, days)
      const chat = await chatsService.findChatByTelegramId(payment.user.telegramId)
      if (!chat) {
        logger.error('Chat not found', {body: req.body})
        res.sendStatus(200)
        return
      }
      await bot.api
        .sendMessage(
          chat.telegramId,
          translate('pay-success', chat.languageCode, {hasReceipt: 'false'}),
          {parse_mode: 'HTML'},
        )
        .catch(logger.error)
      logger.info('Payment success')
    } else if (body.payload.status === 'expired') {
      payment.status = 'failed'
      await payment.save()
    } else logger.error('Invalid status', {body})
  } else logger.error('Invalid payload', {body})

  res.sendStatus(200)
})

function checkSignature({body, headers}: Request): boolean {
  const token = config.get('CRYPTO_BOT_API_KEY') ?? ''
  const secret = crypto.createHash('sha256').update(token).digest()
  const checkString = JSON.stringify(body)
  const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex')
  return hmac === headers['crypto-pay-api-signature']
}

import {Router, Request, Response, NextFunction} from 'express'
import crypto from 'crypto'
import {LoggerService} from '../../logger/logger.service'
import {ConfigService} from '../../config/config.service'
import {paymentsService} from '../../payments/payments.service'
import {subscriptionsService} from '../../subscriptions/subscriptions.service'
import {chatsService} from '../../chats/chats.service'
import {translate} from '../../i18n/i18n.helper'
import {bot} from '../../bot'

const logger = new LoggerService('WalletRouter')

export const walletRouter = Router()

const onlyFromIPs = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip
    if (!allowedIPs.includes(`${clientIP}`)) {
      res.sendStatus(403)
      return
    }
    return next()
  }
}
const walletIPs = ['172.255.248.29', '172.255.248.12']
walletRouter.route('/wallet').post(onlyFromIPs(walletIPs), async (req, res) => {
  const timestamp = req.get('WalletPay-Timestamp')
  const signature = req.get('WalletPay-Signature')
  const method = 'POST'
  const path = '/wallet'
  const body = JSON.stringify(req.body)
  const secret = `${ConfigService.walletApiKey}`
  const message = `${method}.${path}.${timestamp}.${Buffer.from(body).toString('base64')}`
  const hash = crypto.createHmac('sha256', secret).update(message).digest('base64')

  if (hash === signature) {
    logger.debug('Valid signature')
    const type = req.body.type as 'ORDER_FAILED' | 'ORDER_PAID'
    const payload = req.body.payload as {
      status?: 'ACTIVE' | 'EXPIRED' | 'PAID' | 'CANCELLED'
      id: number
      externalId: string
    }
    const payment = await paymentsService.findById(payload.externalId)
    if (!payment) {
      logger.error('Payment not found', {body: req.body})
      return res.sendStatus(404)
    }
    if (type === 'ORDER_PAID') {
      logger.info('Payment success')
      payment.status = 'completed'
      await payment.save()
      const days = payment.plan.name === 'month' ? 30 : 360
      await subscriptionsService.giveDaysToUser(payment.user, days)
      const chat = await chatsService.findChatByTelegramId(payment.user.telegramId)
      if (!chat) {
        logger.error('Chat not found', {body: req.body})
        return res.sendStatus(404)
      }
      await bot.api
        .sendMessage(chat.telegramId, translate('pay-success', chat.languageCode))
        .catch(logger.error)
    } else if (type === 'ORDER_FAILED') {
      logger.info('Payment failed')
      payment.status = 'failed'
      await payment.save()
    }
    return res.sendStatus(200)
  }

  logger.fatal('Invalid Signature')
  return res.sendStatus(401)
})

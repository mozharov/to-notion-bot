import {Router, Request, Response, NextFunction} from 'express'
import crypto from 'crypto'
import {LoggerService} from '../../logger/logger.service'
import {config} from '../../config/config.service'
import {paymentsService} from '../../payments/payments.service'
import {subscriptionsService} from '../../subscriptions/subscriptions.service'
import {chatsService} from '../../chats/chats.service'
import {translate} from '../../i18n/i18n.helper'
import {bot} from '../../bot'

const logger = new LoggerService('WalletRouter')

export const walletRouter = Router()

const onlyFromIPs = (allowedIPs: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    if (!ip || !allowedIPs.includes(Array.isArray(ip) ? ip[0] ?? '' : ip)) {
      logger.debug('Invalid IP', ip)
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
  const secret = config.get('WALLET_API_KEY')
  if (!secret) {
    logger.fatal('Wallet API key not configured')
    return res.sendStatus(500)
  }
  const message = `${method}.${path}.${timestamp}.${Buffer.from(body).toString('base64')}`
  const hash = crypto.createHmac('sha256', secret).update(message).digest('base64')

  if (hash === signature) {
    logger.debug('Valid signature', {body: req.body})
    const data = req.body[0] as {
      eventId: number
      evendDateTime: string
      type: 'ORDER_FAILED' | 'ORDER_PAID'
      payload: {
        status?: 'ACTIVE' | 'EXPIRED' | 'PAID' | 'CANCELLED'
        id: number
        number: string
        externalId: string
      }
    }
    const payment = await paymentsService.findById(data.payload.externalId)
    if (!payment) {
      logger.error('Payment not found')
      return res.sendStatus(200)
    }
    const chat = await chatsService.findChatByTelegramId(payment.user.telegramId)
    if (!chat) logger.error('Chat not found')
    if (data.type === 'ORDER_PAID') {
      logger.info('Payment success')
      payment.status = 'completed'
      await payment.save()
      const days = payment.plan.name === 'month' ? 30 : 360
      await subscriptionsService.giveDaysToUser(payment.user, days)
      await bot.api
        .sendMessage(
          payment.user.telegramId,
          translate('pay-success', chat?.languageCode, {
            hasReceipt: 'false',
          }),
          {parse_mode: 'HTML'},
        )
        .catch(logger.error)
    } else if (data.type === 'ORDER_FAILED') {
      logger.info('Payment failed')
      payment.status = 'failed'
      await payment.save()
      await bot.api
        .sendMessage(payment.user.telegramId, translate('pay-failed', chat?.languageCode), {
          parse_mode: 'HTML',
        })
        .catch(logger.error)
    }
    return res.sendStatus(200)
  }

  logger.fatal('Invalid Signature')
  return res.sendStatus(401)
})

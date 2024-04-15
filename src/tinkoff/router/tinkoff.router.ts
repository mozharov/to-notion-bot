import {Router} from 'express'
import NalogAPI from 'moy-nalog'
import _ from 'lodash'
import {ConfigService} from '../../config/config.service'
import crypto from 'crypto'
import {LoggerService} from '../../logger/logger.service'
import {subscriptionsService} from '../../subscriptions/subscriptions.service'
import {chatsService} from '../../chats/chats.service'
import {bot} from '../../bot'
import {paymentsService} from '../../payments/payments.service'

type TinkoffPaymentNotification = {
  TerminalKey: string
  OrderId: string
  PaymentId: number
  ErrorCode: string
  Token: string
  Amount: number
  Success: boolean
  Status?: string
  CardId?: number
  ExpDate?: string
  Data?: {
    [key: string]: string
  }
}

const logger = new LoggerService('TinkoffRouter')

export const tinkoffRouter = Router()

tinkoffRouter.post('/tinkoff', async (req, res) => {
  const data = req.body as unknown as TinkoffPaymentNotification

  // Check Notification Token
  const filteredData = _.omit(data, ['Receipt', 'Data', 'Token'])
  const tokenData = Object.entries(filteredData).map(value => ({[value[0]]: value[1]}))
  tokenData.push({Password: `${ConfigService.tinkoffTerminalPassword}`})
  tokenData.sort((a, b) => {
    const keyA = Object.keys(a)[0]
    const keyB = Object.keys(b)[0]
    if (!keyA || !keyB) return 0
    if (keyA < keyB) return -1
    if (keyA > keyB) return 1
    return 0
  })
  const tokenStringArray = tokenData.map(value => Object.values(value)[0]) as string[]
  const tokenStringData = tokenStringArray.join('')
  const tokenHash = crypto.createHash('sha256').update(tokenStringData).digest('hex')
  if (tokenHash !== data.Token) throw new Error('Invalid token')

  if (!data.Success || data.ErrorCode !== '0') {
    if (data.ErrorCode === '1051') {
      logger.info('Payment was not successful. Insufficient balance.')
    } else logger.error('Payment was not successful', {data})
  }

  const payment = await paymentsService.findById(data.OrderId)
  if (!payment) {
    logger.error('Payment was not found')
    res.sendStatus(200)
    return
  }

  if (data.Status === 'REJECTED') {
    payment.status = 'failed'
    await payment.save()
    logger.info('Payment was rejected')
  } else if (data.Status === 'REFUNDED') {
    // TODO: пока ничего не делаем, но потом надо либо отменять подписку и сообщать пользователю
    if (payment.moyNalogReceiptId) {
      try {
        logger.info('Cancel receipt to Moy Nalog...')
        if (!ConfigService.moyNalogLogin || !ConfigService.moyNalogPassword) {
          logger.warn('Moy Nalog credentials not found')
        } else {
          const nalog = new NalogAPI({
            login: ConfigService.moyNalogLogin,
            password: ConfigService.moyNalogPassword,
            autologin: true,
          })
          await nalog.call('cancel', {
            comment: 'Возврат средств',
            receiptUuid: payment.moyNalogReceiptId,
            operationTime: nalog.dateToLocalISO(),
            requestTime: nalog.dateToLocalISO(),
          })
        }
      } catch (error) {
        logger.error('Failed to cancel receipt in Moy Nalog', {error, payment})
      }
    }
    payment.status = 'failed'
    await payment.save()
    logger.info('Payment was refunded')
  } else if (data.Status === 'CONFIRMED') {
    payment.status = 'completed'
    await payment.save()

    const days = payment.plan.name === 'month' ? 30 : 360
    await subscriptionsService.giveDaysToUser(payment.user, days)

    let receiptURL = ''

    if (!ConfigService.moyNalogLogin || !ConfigService.moyNalogPassword) {
      logger.warn('Moy Nalog credentials not found')
    } else {
      try {
        const nalog = new NalogAPI({
          login: ConfigService.moyNalogLogin,
          password: ConfigService.moyNalogPassword,
          autologin: true,
        })
        const receipt = await nalog.addIncome({
          amount: payment.amount / 100,
          name: 'Предоставление информационных услуг',
        })
        receiptURL = receipt.printUrl
        payment.moyNalogReceiptId = receipt.id
        await payment.save()
      } catch (error: unknown) {
        logger.error('Failed to create income in Moy Nalog', {error, payment})
      }
    }

    const chat = await chatsService.findChatByTelegramId(payment.user.telegramId)
    const receiptText =
      chat?.languageCode === 'ru'
        ? `(<a href="${receiptURL}">чек</a>)`
        : `(<a href="${receiptURL}">receipt</a>)`
    const successSubscriptionText =
      chat?.languageCode === 'ru'
        ? `✅ <b>Платеж прошел успешно!</b> ${
            receiptURL && receiptText
          }\n\nСтатус подписки можно отследить по команде /subscription`
        : `✅ <b>The payment was successful!</b> ${
            receiptURL && receiptText
          }\n\nThe subscription status can be tracked by the command /subscription`

    await bot.api
      .sendMessage(payment.user.telegramId, successSubscriptionText, {parse_mode: 'HTML'})
      .catch(logger.error)
    logger.info('Payment was successful')
  }
  res.sendStatus(200)
})

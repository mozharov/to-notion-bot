import 'reflect-metadata'
import dotenv from 'dotenv'
import {ConfigService} from './config/config.service'
dotenv.config({
  path: ['.env.local', '.env'],
  debug: ConfigService.isDevelopment,
  override: false,
})
import {webhookCallback} from 'grammy'
import express from 'express'
import {bot} from './bot'
import {LoggerService} from './logger/logger.service'
import {DataSource} from './typeorm/typeorm.data-source'
import {filesService} from './files/files.service'
import superagent from 'superagent'
import crypto from 'crypto'
import {paymentsService} from './payments/payments.service'
import {subscriptionsService} from './subscriptions/subscriptions.service'
import {chatsService} from './chats/chats.service'
import {translate} from './i18n/i18n.helper'
import _ from 'lodash'
import NalogAPI from 'moy-nalog'
// TODO: Рефактор сервера; Теперь приложение разделяется на бота и сервер, нужно вынести в отдельный модуль сервер и его модули
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

async function bootstrap(): Promise<void> {
  const logger = new LoggerService('Bootstrap')
  logger.debug('Starting bot')
  ConfigService.validateEnv()
  await DataSource.initialize()

  const app = express()
  app.use(express.json())

  app.route('/tinkoff').post(async (req, res) => {
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

  const onlyFromIPs = (allowedIPs: string[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
      const clientIP = req.ip
      if (!allowedIPs.includes(`${clientIP}`)) {
        res.sendStatus(403)
        return
      }
      return next()
    }
  }
  const walletIPs = ['172.255.248.29', '172.255.248.12']
  app.route('/wallet').post(onlyFromIPs(walletIPs), async (req, res) => {
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

  // Файлы не будут отображаться в Notion при localhost
  app.route('/file/:id/:fileId.:extension').get(async (req, res) => {
    const {id, fileId, extension} = req.params
    logger.debug('File requested')
    const check = /^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/
    if (!check.test(id)) {
      logger.debug('Invalid file id')
      return res.status(400).send('Invalid id')
    }

    const file = await filesService.findFile({id, fileId, extension})
    if (!file) {
      logger.debug('File not found')
      return res.status(404).send('File not found')
    }
    const tgFile = await bot.api.getFile(file.fileId)
    logger.debug({
      message: 'File found',
      tgFile,
    })
    const fileUrl = `https://api.telegram.org/file/bot${ConfigService.botToken}/${tgFile.file_path}`
    return superagent(fileUrl).pipe(res)
  })

  app.use(
    webhookCallback(bot, 'express', {
      secretToken: ConfigService.webhookSecret,
      onTimeout(...args) {
        logger.fatal({
          error: args,
          message: 'Webhook timeout',
        })
      },
      timeoutMilliseconds: ConfigService.webhookTimeout,
    }),
  )
  app.listen(ConfigService.port, () => {
    logger.debug(`Listening on port ${ConfigService.port}`)
  })
}

void bootstrap()

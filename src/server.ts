import express, {NextFunction, Request, Response} from 'express'
import 'express-async-errors'
import {tinkoffRouter} from './tinkoff/router/tinkoff.router'
import {walletRouter} from './wallet/router/wallet.router'
import {filesRouter} from './files/router/files.router'
import {bot} from './bot'
import {config} from './config/config.service'
import {LoggerService} from './logger/logger.service'
import {webhookCallback} from 'grammy'

const logger = new LoggerService('Server')

export function launchServer(): void {
  const app = express()
  app.use(express.json())

  app.use(tinkoffRouter)
  app.use(walletRouter)
  app.use(filesRouter)

  app.use(
    webhookCallback(bot, 'express', {
      secretToken: config.get('BOT_WEBHOOK_SECRET'),
      onTimeout(...args) {
        logger.fatal({
          error: args,
          message: 'Webhook timeout',
        })
      },
    }),
  )

  app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    logger.fatal('Unhandled error occurred', {error})
    res.status(500).send('Internal Server Error')
    return next()
  })

  app.listen(config.get('PORT'), () => logger.debug('Server started'))
}

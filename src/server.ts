import express from 'express'
import {tinkoffRouter} from './tinkoff/router/tinkoff.router'
import {walletRouter} from './wallet/router/wallet.router'
import {filesRouter} from './files/router/files.router'
import {bot} from './bot'
import {ConfigService} from './config/config.service'
import {LoggerService} from './logger/logger.service'
import {webhookCallback} from 'grammy'

// TODO: добавить обработчик ошибок и добавить библиотеку исправляющую ассинхронные ошибки
export function launchServer(): void {
  const logger = new LoggerService('Server')

  const app = express()
  app.use(express.json())

  app.use(tinkoffRouter)
  app.use(walletRouter)
  app.use(filesRouter)

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
    logger.debug('Server started', {
      port: ConfigService.port,
    })
  })
}

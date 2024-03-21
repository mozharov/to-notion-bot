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

async function bootstrap(): Promise<void> {
  const logger = new LoggerService('Bootstrap')
  logger.debug('Starting bot')
  ConfigService.validateEnv()
  await DataSource.initialize()

  const app = express()
  app.use(express.json())
  app.use(
    webhookCallback(bot, 'express', {
      secretToken: ConfigService.webhookSecret,
      onTimeout(...args) {
        logger.fatal({
          error: args,
          message: 'Webhook timeout',
        })
      },
      timeoutMilliseconds: 30000,
    }),
  )
  app.listen(ConfigService.port, () => {
    logger.info(`Listening on port ${ConfigService.port}`)
  })
}

bootstrap()

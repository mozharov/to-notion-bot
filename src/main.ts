import {ConfigService} from './config/config.service'
import dotenv from 'dotenv'
dotenv.config({
  path: ['.env.local', '.env'],
  debug: ConfigService.isDevelopment,
  override: false,
})
import {webhookCallback} from 'grammy'
import express from 'express'
import {bot} from './bot'

async function bootstrap(): Promise<void> {
  const app = express()
  app.use(express.json())
  app.use(
    webhookCallback(bot, 'express', {
      secretToken: ConfigService.webhookSecret,
      onTimeout(...args) {
        console.error('Timeout', args)
      },
      timeoutMilliseconds: 30000,
    }),
  )
  app.listen(ConfigService.port, () => {
    console.info(`Listening on port ${ConfigService.port}`)
  })
}

bootstrap()

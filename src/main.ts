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

async function bootstrap(): Promise<void> {
  const logger = new LoggerService('Bootstrap')
  logger.debug('Starting bot')
  ConfigService.validateEnv()
  await DataSource.initialize()

  const app = express()
  app.use(express.json())

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

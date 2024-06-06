import express, {NextFunction, Request, Response} from 'express'
import 'express-async-errors'
import {filesRouter} from './files/router/files.router'
import {bot} from './bot'
import {config} from './config/config.service'
import {LoggerService} from './logger/logger.service'
import {webhookCallback} from 'grammy'
import {broadcasterRouter} from './broadcaster/router/broadcaster.router'
import {subscriptionsRouter} from './subscriptions/router/subscriptions.router'
import {notionWorkspacesRouter} from './notion/notion-workspaces/router/notion-workspaces.router'

const logger = new LoggerService('Server')

export function launchServer(): void {
  const app = express()
  app.use(express.json())

  app.use(filesRouter)
  app.use(broadcasterRouter)
  app.use(subscriptionsRouter)
  app.use(notionWorkspacesRouter)

  app.use(
    webhookCallback(bot, 'express', {
      secretToken: config.get('BOT_WEBHOOK_SECRET'),
      onTimeout(...args) {
        logger.fatal('Webhook timeout', args)
      },
    }),
  )

  app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    logger.fatal('Unhandled error occurred', error)
    res.status(500).send('Internal Server Error')
    return next()
  })

  app.listen(config.get('PORT'), () => logger.debug('Server started'))
}

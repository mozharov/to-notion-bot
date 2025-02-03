import {startServer} from './app.js'
import {logger} from './lib/logger.js'
import {config} from './config.js'
import {startTunnel, stopTunnel} from './lib/tunnel.js'
import {serializeError} from 'serialize-error'
import {deleteWebhook, setWebhook} from './bot/webhook.js'
import {posthog} from './lib/posthog.js'
import {migrateDatabase} from './lib/database/database.js'
import {startCronJobs} from './services/cron/cron.js'

if (config.DB_MIGRATE) migrateDatabase()

const server = startServer()
server.once('listening', () => {
  startCronJobs()
  if (config.NGROK_TOKEN) {
    void startTunnel().then(tunnelUrl => setWebhook(tunnelUrl))
  }
})

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))

async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down...`)
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 10000)

  if (config.NGROK_TOKEN) {
    await deleteWebhook()
    await stopTunnel()
  }

  await posthog.shutdown(5000)

  server.close(error => {
    if (error) {
      logger.error({error: serializeError(error)}, 'Failed to close server')
      process.exit(1)
    }
    logger.info('Server closed')
    process.exit(0)
  })
}

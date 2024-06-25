import 'reflect-metadata'
import {LoggerService} from './logger/logger.service'
import {DataSource} from './typeorm/typeorm.data-source'
import {launchServer} from './server'
import {sessionPostgresClient} from './session/session.composer'
import {analytics} from './analytics/analytics.service'

const logger = new LoggerService('Bootstrap')

async function bootstrap(): Promise<void> {
  logger.debug('Starting...')
  await sessionPostgresClient.connect()
  await DataSource.initialize()
  launchServer()
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

void bootstrap().catch(() => {
  process.exit(1)
})

async function shutdown(): Promise<void> {
  setTimeout(() => {
    process.exit(1)
  }, 10000)
  await Promise.all([analytics.shutdown(), DataSource.destroy()])
}

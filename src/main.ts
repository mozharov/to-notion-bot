import 'reflect-metadata'
import {ConfigService} from './config/config.service'
import {LoggerService} from './logger/logger.service'
import {DataSource} from './typeorm/typeorm.data-source'
import {launchServer} from './server'

async function bootstrap(): Promise<void> {
  const logger = new LoggerService('Bootstrap')
  logger.debug('Starting...')
  ConfigService.validateEnv()
  await DataSource.initialize()
  launchServer()
}

void bootstrap()

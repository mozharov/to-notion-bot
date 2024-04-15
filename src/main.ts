import 'reflect-metadata'
import {LoggerService} from './logger/logger.service'
import {DataSource} from './typeorm/typeorm.data-source'
import {launchServer} from './server'

const logger = new LoggerService('Bootstrap')

async function bootstrap(): Promise<void> {
  logger.debug('Starting...')
  await DataSource.initialize()
  launchServer()
}

void bootstrap()

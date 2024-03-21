import dotenv from 'dotenv'
import {ConfigService} from '../config/config.service'
dotenv.config({
  path: ['.env.local', '.env'],
  debug: ConfigService.isDevelopment,
  override: false,
})
import {DataSource} from 'typeorm'
import typeormOptions from './typeorm.options'

function buildTypeormMigrationConfig(): DataSource {
  ConfigService.validateEnv()
  return new DataSource(typeormOptions)
}

export default buildTypeormMigrationConfig()

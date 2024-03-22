import {DataSourceOptions} from 'typeorm'
import {ConfigService} from '../config/config.service'
import {User} from '../users/entities/user.entity'
import {Chat} from '../chats/entities/chat.entity'

function buildTypeormConfig(): DataSourceOptions {
  return {
    entities: [User, Chat],
    migrations: [],
    subscribers: [],
    type: 'postgres',
    host: ConfigService.database.DB_HOST,
    port: ConfigService.database.DB_PORT,
    username: ConfigService.database.DB_USER,
    password: ConfigService.database.DB_PASSWORD,
    database: ConfigService.database.DB_NAME,
    synchronize: ConfigService.database.DB_SYNCHRONIZE,
    migrationsRun: ConfigService.database.DB_MIGRATION_RUN,
    migrationsTableName: 'migrations',
    logging: ConfigService.loggerLevel === 'trace',
  }
}

export default buildTypeormConfig()

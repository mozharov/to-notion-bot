import {DataSourceOptions} from 'typeorm'
import {ConfigService, LogLevel} from '../config/config.service'
import {User} from '../users/entities/user.entity'
import {Chat} from '../chats/entities/chat.entity'
import {Session} from '../session/entities/session.entity'
import {NotionWorkspace} from '../notion/notion-workspaces/entities/notion-workspace.entity'
import {NotionDatabase} from '../notion/notion-databases/entities/notion-database.entity'
import {Message} from '../messages/entities/message.entity'
import {File} from '../files/entities/file.entity'
import {Subscription} from '../subscriptions/entities/subscription.entity'
import {Plan} from '../subscriptions/plans/entities/plan.entity'
import {Payment} from '../payments/entities/payment.entity'
import {Broadcasting} from '../broadcaster/entities/broadcasting.entity'

function buildTypeormConfig(): DataSourceOptions {
  return {
    entities: [
      User,
      Chat,
      Session,
      NotionWorkspace,
      NotionDatabase,
      Message,
      File,
      Subscription,
      Plan,
      Payment,
      Broadcasting,
    ],
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
    logging: ConfigService.loggerLevel >= LogLevel.Trace,
  }
}

export default buildTypeormConfig()

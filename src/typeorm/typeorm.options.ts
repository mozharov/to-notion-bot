import {config} from '../config/config.service'
import {DataSourceOptions} from 'typeorm'
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
import {Referral} from '../referral/entities/referral.entity'
import {Promocode} from '../promocodes/entities/promocode.entity'
import {PromocodeActivation} from '../promocodes/entities/promocode-activation.entity'
import {LogLevel} from '../logger/logger.service'

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
      Referral,
      Promocode,
      PromocodeActivation,
    ],
    migrations: [],
    subscribers: [],
    type: 'postgres',
    host: config.get('DB_HOST'),
    port: config.get('DB_PORT'),
    username: config.get('DB_USER'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_NAME'),
    synchronize: config.get('DB_SYNCHRONIZE'),
    migrationsRun: config.get('DB_MIGRATIONS_RUN'),
    migrationsTableName: 'migrations',
    logging: config.get('LOGGER_LEVEL') >= LogLevel.Trace,
  }
}

export default buildTypeormConfig()

import * as Joi from 'joi'
import {LoggerService} from '../logger/logger.service'
import {UserFromGetMe} from 'grammy/types'

export enum LogLevel {
  Fatal = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
  Trace = 5,
}

type Configuration = {
  NODE_ENV: 'production' | 'development' | 'test'
  WEBHOOK_SECRET: string
  BOT_TOKEN: string
  PORT: number
  LOGGER_FORMAT: 'json' | 'pretty'
  LOGGER_LEVEL: LogLevel
  DB_HOST: string
  DB_PORT: number
  DB_NAME: string
  DB_USER: string
  DB_PASSWORD: string
  DB_SYNCHRONIZE: boolean
  DB_MIGRATION_RUN: boolean
  FETCH_BOT_INFO: boolean
  BOT_FIRST_NAME: string
  BOT_USERNAME: string
  BOT_ID: number
  MAX_CHATS_PER_USER: number
  WEBHOOK_TIMEOUT: number
  MAX_NOTION_WORKSPACES_PER_USER: number
  BOT_API_URL: string
  WALLET_API_KEY: string
  ADMIN_TELEGRAM_ID: number
}

export class ConfigService {
  public static validateEnv(): Configuration {
    const logger = new LoggerService('ConfigService')

    const configValidation = Joi.object<Configuration>({
      NODE_ENV: Joi.string().valid('development', 'production', 'test').default('production'),
      WEBHOOK_SECRET: Joi.string().required(),
      BOT_TOKEN: Joi.string().required(),
      PORT: Joi.number().default(8443),
      LOGGER_FORMAT: Joi.string().valid('json', 'pretty').default('json'),
      LOGGER_LEVEL: Joi.number().valid(0, 1, 2, 3, 4, 5).default(3),
      DB_HOST: Joi.string().required(),
      DB_PORT: Joi.number().required(),
      DB_NAME: Joi.string().required(),
      DB_USER: Joi.string().required(),
      DB_PASSWORD: Joi.string().required(),
      DB_SYNCHRONIZE: Joi.boolean().default(false),
      DB_MIGRATION_RUN: Joi.boolean().default(false),
      FETCH_BOT_INFO: Joi.boolean().default(false),
      BOT_FIRST_NAME: Joi.string(),
      BOT_USERNAME: Joi.string(),
      BOT_ID: Joi.number(),
      MAX_CHATS_PER_USER: Joi.number().default(90),
      WEBHOOK_TIMEOUT: Joi.number().default(30000),
      MAX_NOTION_WORKSPACES_PER_USER: Joi.number().default(90),
      BOT_API_URL: Joi.string().default('http://localhost:8443/'),
      WALLET_API_KEY: Joi.string().required(),
      ADMIN_TELEGRAM_ID: Joi.number().required(),
    }).validate(process.env, {
      stripUnknown: true,
    })

    if (configValidation.error) {
      logger.fatal({
        error: configValidation.error,
        message: 'Invalid configuration',
      })
      throw configValidation.error
    }

    return configValidation.value
  }

  public static get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development'
  }

  public static get webhookSecret(): Configuration['WEBHOOK_SECRET'] {
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('WEBHOOK_SECRET is not defined')
    }
    return webhookSecret
  }

  public static get botToken(): Configuration['BOT_TOKEN'] {
    const botToken = process.env.BOT_TOKEN
    if (!botToken) {
      throw new Error('BOT_TOKEN is not defined')
    }
    return botToken
  }

  public static get port(): Configuration['PORT'] {
    return Number(process.env.PORT)
  }

  public static get loggerFormat(): Configuration['LOGGER_FORMAT'] {
    return process.env.LOGGER_FORMAT as Configuration['LOGGER_FORMAT']
  }

  public static get loggerLevel(): Configuration['LOGGER_LEVEL'] {
    return Number(process.env.LOGGER_LEVEL) as Configuration['LOGGER_LEVEL']
  }

  public static get database(): Pick<
    Configuration,
    | 'DB_HOST'
    | 'DB_PORT'
    | 'DB_NAME'
    | 'DB_USER'
    | 'DB_PASSWORD'
    | 'DB_SYNCHRONIZE'
    | 'DB_MIGRATION_RUN'
  > {
    return {
      DB_HOST: process.env.DB_HOST as Configuration['DB_HOST'],
      DB_PORT: Number(process.env.DB_PORT),
      DB_NAME: process.env.DB_NAME as Configuration['DB_NAME'],
      DB_USER: process.env.DB_USER as Configuration['DB_USER'],
      DB_PASSWORD: process.env.DB_PASSWORD as Configuration['DB_PASSWORD'],
      DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true',
      DB_MIGRATION_RUN: process.env.DB_MIGRATION_RUN === 'true',
    }
  }

  public static get botInfo(): UserFromGetMe | undefined {
    return process.env.FETCH_BOT_INFO !== 'true'
      ? {
          id: Number(process.env.BOT_ID),
          username: process.env.BOT_USERNAME as Configuration['BOT_USERNAME'],
          first_name: process.env.BOT_FIRST_NAME as Configuration['BOT_FIRST_NAME'],
          can_join_groups: true,
          can_read_all_group_messages: false,
          supports_inline_queries: false,
          is_bot: true,
        }
      : undefined
  }

  public static get maxChatsPerUser(): Configuration['MAX_CHATS_PER_USER'] {
    return Number(process.env.MAX_CHATS_PER_USER)
  }

  public static get webhookTimeout(): Configuration['WEBHOOK_TIMEOUT'] {
    return Number(process.env.WEBHOOK_TIMEOUT)
  }

  public static get maxNotionWorkspacesPerUser(): Configuration['MAX_NOTION_WORKSPACES_PER_USER'] {
    return Number(process.env.MAX_NOTION_WORKSPACES_PER_USER)
  }

  public static get botApiUrl(): Configuration['BOT_API_URL'] {
    return process.env.BOT_API_URL as Configuration['BOT_API_URL']
  }

  public static get walletApiKey(): Configuration['WALLET_API_KEY'] {
    return process.env.WALLET_API_KEY as Configuration['WALLET_API_KEY']
  }

  public static get adminTelegramId(): Configuration['ADMIN_TELEGRAM_ID'] {
    return Number(process.env.ADMIN_TELEGRAM_ID)
  }
}

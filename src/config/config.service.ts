import * as Joi from 'joi'
import {LoggerService} from '../logger/logger.service'

export class ConfigService {
  public static validateEnv(): void {
    const logger = new LoggerService('ConfigService')

    const configValidation = Joi.object({
      NODE_ENV: Joi.string().valid('development', 'production', 'test').default('production'),
      WEBHOOK_SECRET: Joi.string().required(),
      BOT_TOKEN: Joi.string().required(),
      PORT: Joi.number().default(8443),
      LOGGER_FORMAT: Joi.string().valid('json', 'pretty').default('json'),
      LOGGER_LEVEL: Joi.string()
        .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
        .default('info'),
      DB_HOST: Joi.string().required(),
      DB_PORT: Joi.number().required(),
      DB_NAME: Joi.string().required(),
      DB_USER: Joi.string().required(),
      DB_PASSWORD: Joi.string().required(),
      DB_SYNCHRONIZE: Joi.boolean().default(false),
      DB_MIGRATION_RUN: Joi.boolean().default(false),
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
    return process.env.LOGGER_LEVEL as Configuration['LOGGER_LEVEL']
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

  public get<K extends keyof Configuration>(key: K): Configuration[K] {
    return process.env[key] as Configuration[K]
  }
}

type Configuration = {
  NODE_ENV: 'production' | 'development' | 'test'
  WEBHOOK_SECRET: string
  BOT_TOKEN: string
  PORT: number
  LOGGER_FORMAT: 'json' | 'pretty'
  LOGGER_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
  DB_HOST: string
  DB_PORT: number
  DB_NAME: string
  DB_USER: string
  DB_PASSWORD: string
  DB_SYNCHRONIZE: boolean
  DB_MIGRATION_RUN: boolean
}

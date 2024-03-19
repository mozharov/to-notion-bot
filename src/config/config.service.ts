import * as Joi from 'joi'

export class ConfigService {
  public static get validateEnv(): Joi.ValidationResult<Configuration> {
    return Joi.object({
      NODE_ENV: Joi.string().valid('development', 'production', 'test').default('production'),
      WEBHOOK_SECRET: Joi.string().required(),
      BOT_TOKEN: Joi.string().required(),
      PORT: Joi.number().default(8443),
      LOGGER_FORMAT: Joi.string().valid('json', 'pretty').default('json'),
      LOGGER_LEVEL: Joi.string()
        .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
        .default('info'),
    }).validate(process.env)
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
}

import * as Joi from 'joi'

export class ConfigService {
  public static get validateEnv(): Joi.ValidationResult<Configuration> {
    return Joi.object({
      NODE_ENV: Joi.string().valid('development', 'production', 'test').default('production'),
      WEBHOOK_SECRET: Joi.string().required(),
      BOT_TOKEN: Joi.string().required(),
      PORT: Joi.number().default(8443),
    }).validate(process.env)
  }

  public static get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development'
  }

  public static get webhookSecret(): string {
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('WEBHOOK_SECRET is not defined')
    }
    return webhookSecret
  }

  public static get botToken(): string {
    const botToken = process.env.BOT_TOKEN
    if (!botToken) {
      throw new Error('BOT_TOKEN is not defined')
    }
    return botToken
  }

  public static get port(): number {
    return Number(process.env.PORT)
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
}

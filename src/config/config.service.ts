import dotenv from 'dotenv'
dotenv.config({
  path: ['.env.local', '.env'],
  debug: process.env.NODE_ENV === 'development',
  override: false,
})
import {Configuration} from './models/configuration.model'
import {plainToClass} from 'class-transformer'
import {validateSync} from 'class-validator'

export class ConfigService {
  private readonly config: Configuration

  constructor() {
    const config = plainToClass(Configuration, process.env, {
      excludeExtraneousValues: true,
      exposeUnsetFields: true,
    })
    const errors = validateSync(config)
    if (errors.length) throw errors
    this.config = config
  }

  public get<K extends keyof Configuration>(key: K): Configuration[K] {
    return this.config[key]
  }
}

export const config = new ConfigService()

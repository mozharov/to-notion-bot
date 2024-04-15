import {IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString} from 'class-validator'
import {LogLevel} from '../../logger/logger.service'
import {Expose, Transform} from 'class-transformer'

export class Configuration {
  @Expose()
  @IsEnum(['production', 'development', 'test'])
  NODE_ENV: 'production' | 'development' | 'test'

  @Expose()
  @IsString()
  @IsNotEmpty()
  BOT_WEBHOOK_SECRET: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  BOT_TOKEN: string

  @Expose()
  @IsBoolean()
  @Transform(({value}) => Boolean(value))
  BOT_FETCH_INFO: boolean

  @Expose()
  @IsInt()
  @Transform(({value}) => parseInt(value))
  BOT_ID: number

  @Expose()
  @IsString()
  @IsNotEmpty()
  BOT_USERNAME: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  BOT_FIRST_NAME: string

  @Expose()
  @IsInt()
  @Transform(({value}) => parseInt(value))
  PORT: number

  @Expose()
  @IsEnum(['json', 'pretty'])
  LOGGER_FORMAT: 'json' | 'pretty'

  @Expose()
  @IsEnum([0, 1, 2, 3, 4, 5])
  @Transform(({value}) => parseInt(value))
  LOGGER_LEVEL: LogLevel

  @Expose()
  @IsString()
  @IsNotEmpty()
  DB_HOST: string

  @Expose()
  @IsInt()
  @Transform(({value}) => parseInt(value))
  DB_PORT: number

  @Expose()
  @IsString()
  @IsNotEmpty()
  DB_NAME: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  DB_USER: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string

  @Expose()
  @IsBoolean()
  @Transform(({value}) => Boolean(value))
  DB_SYNCHRONIZE: boolean

  @Expose()
  @IsBoolean()
  @Transform(({value}) => Boolean(value))
  DB_MIGRATIONS_RUN: boolean

  @Expose()
  @IsInt()
  @Transform(({value}) => parseInt(value))
  MAX_CHATS_PER_USER: number

  @Expose()
  @IsInt()
  @Transform(({value}) => parseInt(value))
  MAX_WORKSPACES_PER_USER: number

  @Expose()
  @IsOptional()
  @IsString()
  @Transform(({value}) => value || undefined)
  WALLET_API_KEY: string | null

  @Expose()
  @IsInt()
  @Transform(({value}) => parseInt(value))
  ADMIN_TELEGRAM_ID: number

  @Expose()
  @IsOptional()
  @IsString()
  @Transform(({value}) => value || undefined)
  TINKOFF_TERMINAL_KEY: string | null

  @Expose()
  @IsOptional()
  @IsString()
  @Transform(({value}) => value || null)
  TINKOFF_TERMINAL_PASSWORD: string | null

  @Expose()
  @IsOptional()
  @IsString()
  @Transform(({value}) => value || null)
  MOY_NALOG_PASSWORD: string | null

  @Expose()
  @IsOptional()
  @IsString()
  @Transform(({value}) => value || null)
  MOY_NALOG_LOGIN: string | null

  @Expose()
  @IsString()
  @IsNotEmpty()
  ORIGIN_DOMAIN: string
}

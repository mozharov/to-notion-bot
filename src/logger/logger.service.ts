import {config} from '../config/config.service'
import * as winston from 'winston'
import {jsonConsole, prettyConsole} from './logger.transports'
import {isNull, isUndefined} from 'lodash'

export class LoggerService {
  private readonly logger: winston.Logger
  private context?: string

  constructor(context?: string) {
    const loggerFormat = config.get('LOGGER_FORMAT')
    const loggerLevel = config.get('LOGGER_LEVEL')
    const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace']
    this.logger = winston.createLogger({
      levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
        trace: 5,
      },
      level: levels[loggerLevel],
      transports: [loggerFormat === 'json' ? jsonConsole : prettyConsole],
    })
    if (context) this.setContext(context)
  }

  public setContext(context: string): void {
    this.context = context
  }

  public trace(value?: unknown, meta?: unknown): void {
    this.logMessage('trace', value, meta)
  }

  public debug(value?: unknown, meta?: unknown): void {
    this.logMessage('debug', value, meta)
  }

  public info(value?: unknown, meta?: unknown): void {
    this.logMessage('info', value, meta)
  }

  public warn(value?: unknown, meta?: unknown): void {
    this.logMessage('warn', value, meta)
  }

  public error(value?: unknown, meta?: unknown): void {
    this.logMessage('error', value, meta)
  }

  public fatal(value?: unknown, meta?: unknown): void {
    this.logMessage('fatal', value, meta)
  }

  private logMessage(level: Level, value?: unknown, meta?: unknown): void {
    const data: LogData = {
      level,
      message: '',
      meta: {
        context: this.context,
      },
    }
    if (typeof value === 'string') data.message = value
    else data.meta.log_data = this.formatUnknownMeta(value)
    if (!isUndefined(meta)) data.meta.meta_data = this.formatUnknownMeta(meta)

    this.logger.log(level, data.message, data.meta)
  }

  private formatUnknownMeta(meta: unknown): Record<string, unknown> | null | undefined {
    if (typeof meta === 'undefined') return
    if (meta instanceof Error) {
      return {
        error: {
          ...meta,
          name: meta.name,
          message: meta.message,
          stack: config.get('NODE_ENV') === 'development' ? meta.stack : undefined,
        },
      }
    }
    if (isNull(meta)) return meta
    try {
      return JSON.parse(JSON.stringify(meta))
    } catch (error) {
      return {error: 'Unknown Error'}
    }
  }
}

interface LogData {
  level: Level
  message: string
  meta: Meta
}
type Meta = Record<string, unknown>
type Level = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
export enum LogLevel {
  Fatal = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
  Trace = 5,
}

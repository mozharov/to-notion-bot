import {config} from '../config/config.service'
import * as winston from 'winston'
import {jsonConsole, prettyConsole} from './logger.transports'

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
    const data: [string, unknown, Record<string, unknown>] = ['', meta, {context: this.context}]
    if (typeof value === 'string') data[0] = value
    else data[2].value = this.formatUnknownMeta(data[1])
    if (typeof meta !== 'undefined') data[2].meta = this.formatUnknownMeta(data[1])

    this.logger.log(level, data[0], data[2])
  }

  private formatUnknownMeta(meta: unknown): unknown {
    if (typeof meta === 'undefined') return undefined
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
    try {
      return JSON.parse(JSON.stringify(meta))
    } catch (error) {
      return {errorWhileLogging: error instanceof Error ? error.message : 'Unknown error'}
    }
  }
}

type Level = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
export enum LogLevel {
  Fatal = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
  Trace = 5,
}

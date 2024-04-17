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

  public trace(text?: string, meta?: unknown): void {
    this.logMessage('trace', text, meta)
  }

  public debug(text?: string, meta?: unknown): void {
    this.logMessage('debug', text, meta)
  }

  public info(text?: string, meta?: unknown): void {
    this.logMessage('info', text, meta)
  }

  public warn(text?: string, meta?: unknown): void {
    this.logMessage('warn', text, meta)
  }

  public error(text?: string, meta?: unknown): void {
    this.logMessage('error', text, meta)
  }

  public fatal(text?: string, meta?: unknown): void {
    this.logMessage('fatal', text, meta)
  }

  private logMessage(level: Level, text?: string, meta?: unknown): void {
    const formattedMeta = typeof meta === 'undefined' ? meta : {meta: this.formatUnknownMeta(meta)}
    this.logger.log(level, text ?? '', {
      context: this.context,
      ...formattedMeta,
    })
  }

  private formatUnknownMeta(meta: unknown): unknown {
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
    return meta
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

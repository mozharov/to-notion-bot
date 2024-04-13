import {ConfigService} from '../config/config.service'
import * as winston from 'winston'
import {jsonConsole, prettyConsole} from './logger.transports'

export class LoggerService {
  private readonly logger: winston.Logger
  private context?: Context

  constructor(context?: Context) {
    const loggerFormat = ConfigService.loggerFormat
    const loggerLevel = ConfigService.loggerLevel
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

  public setContext(context: Context): void {
    this.context = context
  }

  public trace(value: Message, context?: Context): void {
    this.logMessage('trace', value ?? 'trace', context)
  }

  public debug(value?: Message, context?: Context): void {
    this.logMessage('debug', value ?? 'debug', context)
  }

  public info(value?: Message, context?: Context): void {
    this.logMessage('info', value ?? 'info', context)
  }

  public warn(value?: Message, context?: Context): void {
    this.logMessage('warn', value ?? 'warn', context)
  }

  public error(value?: Message, context?: Context): void {
    this.logMessage('error', value ?? 'error', context)
  }

  public fatal(value?: Message, context?: Context): void {
    this.logMessage('fatal', value ?? 'fatal', context)
  }

  public log(value?: Message, context?: Context): void {
    this.info(value, context)
  }

  private logMessage(level: Level, value?: Message, context?: Context): void {
    if (typeof value === 'string') {
      this.logger.log(
        level,
        value,
        typeof context === 'string' ? {context} : {context: this.context, ...context},
      )
    } else {
      const {message, ...meta} = value ?? {}
      this.logger.log(level, message ?? '', {
        ...(typeof context === 'string' ? {context} : {context: this.context, ...context}),
        ...meta,
      })
    }
  }
}

type Context = string | Record<string, unknown>
type Message = string | (Record<string, unknown> & {message?: string; error?: unknown})
type Level = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'

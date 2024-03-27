import {ConfigService} from '../config/config.service'
import * as winston from 'winston'
import {jsonConsole, prettyConsole} from './logger.transports'

export class LoggerService {
  private readonly logger: winston.Logger
  private context?: string

  constructor(context?: string) {
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

  public setContext(context: string): void {
    this.context = context
  }

  public trace(value: Message, context?: string): void {
    this.logMessage('trace', value, context)
  }

  public debug(value: Message, context?: string): void {
    this.logMessage('debug', value, context)
  }

  public info(value: Message, context?: string): void {
    this.logMessage('info', value, context)
  }

  public warn(value: Message, context?: string): void {
    this.logMessage('warn', value, context)
  }

  public error(value: Message, context?: string): void {
    this.logMessage('error', value, context)
  }

  public fatal(value: Message, context?: string): void {
    this.logMessage('fatal', value, context)
  }

  public log(value: Message, context?: string): void {
    this.info(value, context)
  }

  private logMessage(level: Level, value: Message, context?: string): void {
    if (typeof value === 'string') {
      this.logger.log(level, value, {context: context || this.context})
    } else {
      const {message, ...meta} = value
      this.logger.log(level, message || 'UNDEFINED_MESSAGE', {
        context: context || this.context,
        ...meta,
      })
    }
  }
}

type Message = string | (Record<string, unknown> & {message?: string; error?: unknown})
type Level = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'

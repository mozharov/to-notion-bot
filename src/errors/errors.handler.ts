import {ErrorHandler} from 'grammy'
import {Context} from '../context'
import {LoggerService} from '../logger/logger.service'
import {config} from '../config/config.service'
import {KnownError} from './known.error'

export const errorsHandler: ErrorHandler<Context> = async error => {
  const logger = new LoggerService('ErrorsHandler')

  const isKnownError = error.error instanceof KnownError

  if (!isKnownError) {
    logger.fatal({
      error: {
        name: error.name,
        message: error.message,
        stack: config.get('NODE_ENV') === 'development' ? error.stack : undefined,
        instance: error.error,
      },
      message: `Unhandled error: ${error.message}`,
    })
  } else logger.debug(`Known error: ${error.error.message}`)

  try {
    const text = isKnownError
      ? error.error.message
      : '⚠️ Unknown error occurred.\nPlease try again later or contact the support.'
    if (error.ctx.callbackQuery) {
      await error.ctx.answerCallbackQuery({
        text,
      })
      await error.ctx.deleteMessage().catch(() => true)
    } else await error.ctx.reply(text)
  } catch (error) {
    logger.error({
      error,
      message: 'Failed to send error message',
    })
  }
}

import {ErrorHandler} from 'grammy'
import {Context} from '../context'
import {LoggerService} from '../logger/logger.service'
import {KnownError} from './known.error'

export const errorsHandler: ErrorHandler<Context> = async error => {
  const logger = new LoggerService('ErrorsHandler')

  const isKnownError = error.error instanceof KnownError

  if (!isKnownError) logger.fatal('Unhandled error', error)
  else logger.debug('Known error', error)

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
    logger.error('Failed to send error message', error)
  }
}

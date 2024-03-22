import {ErrorHandler} from 'grammy'
import {Context} from '../context'
import {LoggerService} from '../logger/logger.service'

export const errorsHandler: ErrorHandler<Context> = async error => {
  const logger = new LoggerService('ErrorsComposer')
  logger.fatal({
    error: {
      name: error.name,
      message: error.message,
      stack: error.ctx.config.get('NODE_ENV') === 'development' ? error.stack : undefined,
      instance: error.error,
    },
    message: `Unhandled error: ${error.message}`,
  })

  try {
    await error.ctx.reply(
      '⚠️ Unknown error occurred.\nPlease try again later or contact the support.',
    )
  } catch (error) {
    logger.fatal({
      error,
      message: 'Failed to send error message',
    })
  }
}

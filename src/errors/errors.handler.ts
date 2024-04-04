import {ErrorHandler} from 'grammy'
import {Context} from '../context'
import {LoggerService} from '../logger/logger.service'
import {ConfigService} from '../config/config.service'
// TODO: сделать "известные" ошибки, текст которых будет переведен и отправлен пользователю
export const errorsHandler: ErrorHandler<Context> = async error => {
  const logger = new LoggerService('ErrorsComposer')
  logger.error({
    error: {
      name: error.name,
      message: error.message,
      stack: ConfigService.isDevelopment ? error.stack : undefined,
      instance: error.error,
    },
    message: `Unhandled error: ${error.message}`,
  })

  try {
    const text = '⚠️ Unknown error occurred.\nPlease try again later or contact the support.'
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

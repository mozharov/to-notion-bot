import type {ErrorHandler} from 'grammy'
import {KnownError} from '../errors/known-error.js'

export const errorHandler: ErrorHandler = async err => {
  const {ctx, error} = err
  const log = ctx.log

  log.error({error}, 'Bot error')

  const errorResponse =
    error instanceof KnownError
      ? ctx.t(error.translationKey, error.translationParams)
      : ctx.t('error.unknown')

  await ctx.reply(errorResponse, {parse_mode: 'HTML'}).catch((error: unknown) => {
    log.error({error}, 'Failed to reply about error')
  })
}

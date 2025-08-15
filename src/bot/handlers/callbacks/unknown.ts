import type {Middleware} from 'grammy'

export const unknownCallback: Middleware = async ctx => {
  ctx.tracker.capture('unknown callback')
  return ctx.answerCallbackQuery({
    text: ctx.t('outdated-button'),
  })
}

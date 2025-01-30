import type {Middleware} from 'grammy'

export const helpCommand: Middleware = ctx => {
  ctx.tracker.capture('help command')
  return ctx.reply(ctx.t('help'))
}

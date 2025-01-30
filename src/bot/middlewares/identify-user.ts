import type {Middleware} from 'grammy'

export const identifyUser: Middleware = (ctx, next) => {
  if (!ctx.from) return next()
  ctx.tracker.identify({
    language_code: ctx.from.language_code,
    telegram_premium: ctx.from.is_premium,
    first_name: ctx.from.first_name,
    last_name: ctx.from.last_name,
    username: ctx.from.username,
  })
  return next()
}

import {Composer} from 'grammy'
import {i18n, replaceUnsafeSymbols} from '../lib/i18n.js'

export const i18nMiddleware = new Composer()
i18nMiddleware.use(i18n)
i18nMiddleware.use((ctx, next) => {
  const translate = ctx.translate
  ctx.translate = (key, variables) => {
    return replaceUnsafeSymbols(translate(key, variables))
  }
  ctx.t = ctx.translate
  return next()
})

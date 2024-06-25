import {Composer} from 'grammy'
import {analytics} from './analytics.service'
import {Context} from '../context'

export const analyticsComposer = new Composer<Context>()

analyticsComposer.chatType('private').use((ctx, next) => {
  analytics.identify(ctx.from.id, {
    language_code: ctx.from.language_code,
    telegram_premium: ctx.from.is_premium,
    first_name: ctx.from.first_name,
    last_name: ctx.from.last_name,
    username: ctx.from.username,
  })
  return next()
})

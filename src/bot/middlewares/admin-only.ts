import type {ChatTypeContext, Context} from 'grammy'
import {config} from '../../config.js'

export const adminOnly = (ctx: ChatTypeContext<Context, 'private'>) => {
  if (ctx.from.id !== config.TG_ADMIN_ID) return false
  return true
}

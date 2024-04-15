import {ChatTypeContext} from 'grammy'
import {Context} from '../context'
import {config} from '../config/config.service'

export async function isAdmin(ctx: ChatTypeContext<Context, 'private'>): Promise<boolean> {
  return ctx.from.id === config.get('ADMIN_TELEGRAM_ID')
}

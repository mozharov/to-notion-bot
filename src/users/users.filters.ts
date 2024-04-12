import {ChatTypeContext} from 'grammy'
import {Context} from '../context'
import {ConfigService} from '../config/config.service'

export async function isAdmin(ctx: ChatTypeContext<Context, 'private'>): Promise<boolean> {
  return ctx.from.id === ConfigService.adminTelegramId
}

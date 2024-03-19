import {Context, NextFunction} from 'grammy'
import {ConfigService} from './config.service'

export async function setConfigContext(ctx: Context, next: NextFunction): Promise<void> {
  // @ts-expect-error For test
  ctx.config = new ConfigService()
  await next()
}

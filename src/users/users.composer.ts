import {Composer} from 'grammy'
import {Context} from '../context'
import {UsersService} from './users.service'

export const usersComposer = new Composer<Context>()

usersComposer.use(async (ctx, next) => {
  ctx.usersService = new UsersService()
  if (ctx.chat?.type === 'private' && ctx.from) {
    ctx.user = await ctx.usersService.getUserByTelegramId(ctx.from.id)
  }
  return next()
})

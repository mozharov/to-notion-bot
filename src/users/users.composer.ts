import {Composer} from 'grammy'
import {Context} from '../context'
import {UsersService} from './users.service'

export const usersComposer = new Composer<Context>()

usersComposer.chatType('private').use(async (ctx, next) => {
  ctx.usersService = new UsersService()
  ctx.user =
    (await ctx.usersService.getUserByTelegramId(ctx.from.id)) ||
    (await ctx.usersService.createUserByTelegramId(ctx.from.id))

  return next()
})

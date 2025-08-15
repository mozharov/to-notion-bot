import {CommandContext, type Context, type Middleware} from 'grammy'
import {getUserByTelegramId, updateUser} from '../../../models/users.js'

export const giveCommand: Middleware<CommandContext<Context>> = async ctx => {
  const {userId} = parseMatch(ctx.match)
  const user = await getUserByTelegramId(userId)
  if (!user) return ctx.reply(ctx.t('user-not-found'))
  await updateUser(user.id, {
    leftMessages: -1,
    subscriptionEndsAt: null,
  })
  return ctx.reply(ctx.t('give', {user: user.telegramId}))
}

function parseMatch(match: string) {
  const [userId] = match.split(' ')
  if (!userId) {
    throw new Error('Invalid match')
  }
  return {userId: Number(userId)}
}

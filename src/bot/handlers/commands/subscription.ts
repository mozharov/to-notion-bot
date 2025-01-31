import type {ChatTypeContext, Context, Middleware} from 'grammy'

export const subscriptionCommand: Middleware<ChatTypeContext<Context, 'private'>> = async ctx => {
  ctx.tracker.capture('subscription command')
  await ctx.reply(ctx.t('subscription'))
}

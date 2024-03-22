import {Composer} from 'grammy'
import {Context} from '../context'

export const startComposer = new Composer<Context>()

startComposer.command('start', async ctx => {
  await ctx.reply(ctx.t('start'))
})

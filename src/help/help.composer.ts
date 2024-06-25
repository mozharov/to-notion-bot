import {Composer} from 'grammy'
import {Context} from '../context'
import {analytics} from '../analytics/analytics.service'

export const helpComposer = new Composer<Context>()

helpComposer
  .chatType('private')
  .command('help')
  .use(ctx => {
    analytics.track('help command', ctx.from.id)
    return ctx.reply(ctx.t('help'), {parse_mode: 'HTML'})
  })

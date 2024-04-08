import {Composer} from 'grammy'
import {Context} from '../context'

export const helpComposer = new Composer<Context>()

helpComposer
  .chatType('private')
  .command('help')
  .use(ctx => ctx.reply(ctx.t('help'), {parse_mode: 'HTML'}))

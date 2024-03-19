import {Bot} from 'grammy'
import {setConfigContext} from './config/config.middleware'
import {ConfigService} from './config/config.service'

export const bot = new Bot(ConfigService.botToken)

bot.use(setConfigContext)
bot.command('start', ctx => {
  ctx.reply('Welcome! Up and running.')
  // @ts-expect-error For test
  console.log(ctx.config.get('NODE_ENV'))
  return
})
bot.on('message', ctx => ctx.reply('Got another message!'))

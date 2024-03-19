import {Bot} from 'grammy'
import {setConfigContext} from './config/config.middleware'
import {ConfigService} from './config/config.service'
import {LoggerService} from './logger/logger.service'
import {Context} from './context'

export const bot = new Bot<Context>(ConfigService.botToken)

bot.use(setConfigContext)
bot.command('start', ctx => {
  const logger = new LoggerService('Start')
  ctx.reply('Welcome! Up and running.')
  logger.debug(ctx.config.get('NODE_ENV'))
  return
})
bot.on('message', ctx => ctx.reply('Got another message!'))

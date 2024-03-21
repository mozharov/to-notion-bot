import {Bot} from 'grammy'
import {setConfigContext} from './config/config.middleware'
import {ConfigService} from './config/config.service'
import {LoggerService} from './logger/logger.service'
import {Context} from './context'

export const bot = new Bot<Context>(ConfigService.botToken, {
  botInfo: ConfigService.bot.FETCH_BOT_INFO
    ? {
        can_join_groups: true,
        can_read_all_group_messages: false,
        is_bot: true,
        supports_inline_queries: false,
        first_name: ConfigService.bot.BOT_FIRST_NAME,
        username: ConfigService.bot.BOT_USERNAME,
        id: ConfigService.bot.BOT_ID,
      }
    : undefined,
})

bot.use(setConfigContext)
bot.command('start', ctx => {
  const logger = new LoggerService('Start')
  ctx.reply('Welcome! Up and running.')
  logger.debug(ctx.config.get('NODE_ENV'))
  return
})
bot.on('message', ctx => ctx.reply('Got another message!'))

import {webhookCallback} from 'grammy'
import {config} from '../config.js'
import {logger} from '../lib/logger.js'
import {bot} from '../bot/bot.js'

export const botWebhookCallback = webhookCallback(bot, 'koa', {
  secretToken: config.BOT_WEBHOOK_SECRET,
  timeoutMilliseconds: 20_000,
  onTimeout(...args) {
    logger.error({args}, 'Telegram webhook timed out')
  },
})

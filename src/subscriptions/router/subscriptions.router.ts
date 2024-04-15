import {Router} from 'express'
import {LoggerService} from '../../logger/logger.service'
import {config} from '../../config/config.service'
import {subscriptionsService} from '../subscriptions.service'
import {bot} from '../../bot'
import {chatsService} from '../../chats/chats.service'
import {translate} from '../../i18n/i18n.helper'
import {InlineKeyboard} from 'grammy'

const logger = new LoggerService('SubscriptionsRouter')

export const subscriptionsRouter = Router()

subscriptionsRouter.route('/notify-subscription').post(async (req, res) => {
  if (req.get('X-Secret') !== config.get('BOT_WEBHOOK_SECRET')) {
    res.sendStatus(403)
    return
  }
  res.sendStatus(202)
  const tommorow = new Date()
  tommorow.setDate(tommorow.getDate() + 1)
  logger.debug('Tommorow', {tommorow})

  const subscriptions = await subscriptionsService.getSubscriptionsByEndsAtDay(tommorow)

  for (const subscription of subscriptions) {
    const chat = await chatsService.findActiveChatByTelegramId(subscription.user.telegramId)
    if (!chat) continue
    const keyboard = new InlineKeyboard().add({
      text: translate('subscription-expires.renew', chat.languageCode),
      callback_data: 'plans',
    })
    try {
      await bot.api.sendMessage(
        chat.telegramId,
        translate('subscription-expires', chat.languageCode),
        {parse_mode: 'HTML', reply_markup: keyboard},
      )
    } catch (error) {
      logger.error('Failed to send message to user', {error})
    }
  }
})

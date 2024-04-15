import {NextFunction} from 'grammy'
import {Context} from '../context'
import {chatsService} from '../chats/chats.service'
import {subscriptionsService} from './subscriptions.service'
import {messagesService} from '../messages/messages.service'
import {config} from '../config/config.service'
import {LoggerService} from '../logger/logger.service'

const logger = new LoggerService('SubscriptionsMiddleware')

export async function checkSubscription(ctx: Context, next: NextFunction): Promise<void> {
  if (!ctx.chat) return next()
  const chat = await chatsService.getActiveChatByTelegramId(ctx.chat.id)
  const subscription = await subscriptionsService.findActiveSubscriptionByUser(chat.owner)
  if (!subscription) {
    const messages = await messagesService.countMessagesForCurrentMonthByOwner(chat.owner)
    logger.debug(`User ${chat.owner.telegramId} has ${messages} messages in the current month`)
    if (messages >= config.get('MAX_SENDS_PER_USER')) {
      if (chat.silentMode && chat.type !== 'private') {
        await ctx.api.sendMessage(
          chat.owner.telegramId,
          ctx.t('limit-exceeded', {fromChat: 'true'}),
          {parse_mode: 'HTML'},
        )
        return
      }
      await ctx.reply(ctx.t('limit-exceeded', {fromChat: 'false'}), {parse_mode: 'HTML'})
      return
    }
  }
  return next()
}

import {updateUser} from '../../../models/users.js'
import {logger} from '../../../lib/logger.js'
import {bot} from '../../../bot/bot.js'
import {translate} from '../../../bot/lib/i18n.js'
import {getChatByTelegramIdOrThrow} from '../../../models/chats.js'
import {getUsersWithExpiredSubscription} from '../../../models/users.js'

export async function checkSubscriptions() {
  const expiredUsers = await getUsersWithExpiredSubscription()

  for (const user of expiredUsers) {
    logger.info({userId: user.id}, 'Processing expired subscription')
    const chat = await getChatByTelegramIdOrThrow(user.telegramId)

    try {
      await updateUser(user.id, {
        subscriptionEndsAt: null,
        leftMessages: 0,
      })

      await bot.api.sendMessage(
        chat.telegramId,
        translate('subscription.expired', chat.languageCode),
        {parse_mode: 'HTML'},
      )
    } catch (error) {
      logger.error({error, userId: user.id}, 'Error processing expired subscription')
    }
  }

  logger.info(`Processed ${expiredUsers.length} expired subscriptions`)
}

import {Router} from 'express'
import {LoggerService} from '../../logger/logger.service'
import {broadcasterService} from '../broadcaster.service'
import {bot} from '../../bot'
import {GrammyError} from 'grammy'
import {chatsService} from '../../chats/chats.service'
import {config} from '../../config/config.service'

const logger = new LoggerService('BroadcasterRouter')

let isActiveBroadcasting = false

export const broadcasterRouter = Router()

// При выполнении этого эндпионта начинается рассылка по пользователям бота.
// Вызывать эндпоинт следует регулярно, автоматически.
broadcasterRouter.route('/broadcast').post(async (req, res) => {
  logger.info('Broadcasting requested')
  if (req.get('X-Secret') !== config.get('BOT_WEBHOOK_SECRET')) {
    logger.warn('Invalid webhook secret')
    res.sendStatus(403)
    return
  }
  if (isActiveBroadcasting) {
    logger.warn('Broadcasting already in progress')
    res.sendStatus(202)
    return
  }

  logger.info('Broadcasting started')
  isActiveBroadcasting = true
  res.sendStatus(202)
  const broadcastings = await broadcasterService.getBroadcastings(10000)

  for (const broadcasting of broadcastings) {
    try {
      await bot.api.copyMessage(
        broadcasting.telegramUserId,
        broadcasting.telegramSenderId,
        broadcasting.telegramMessageId,
      )
    } catch (error) {
      if (error instanceof GrammyError && (error.error_code === 403 || error.error_code === 400)) {
        logger.warn('User has blocked bot', {error})
        const chat = await chatsService.findChatByTelegramId(broadcasting.telegramUserId)
        if (chat) {
          chat.botStatus = 'blocked'
          await chatsService.updateChat(chat)
        }
      } else logger.fatal('Failed to send message to user', {error})
    }

    await broadcasting.remove()
  }

  isActiveBroadcasting = false
  logger.info('Broadcasting finished')
})

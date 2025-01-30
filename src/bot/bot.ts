import {Bot} from 'grammy'
import {config} from '../config.js'
import {addLoggerToContext} from './middlewares/add-logger-to-context.js'
import {autoRetry} from '@grammyjs/auto-retry'
import {parseMode} from '@grammyjs/parse-mode'
import {errorHandler} from './handlers/error.js'
import {i18nMiddleware} from './middlewares/i18n.js'
import {addTrackerToContext} from './middlewares/add-tracker-to-context.js'
import {privateChats} from './routes/private-chats.js'
import {identifyUser} from './middlewares/identify-user.js'
import {groupsAndChannels} from './routes/groups-and-channels.js'
import {checkMentionMode} from './middlewares/check-mention-mode.js'
import {onlyActiveChat} from './middlewares/only-active-chat.js'
import {messageHandler} from './handlers/message.js'

export const bot = new Bot(config.BOT_TOKEN, {botInfo: config.botInfo})
bot.api.config.use(autoRetry())
bot.api.config.use(parseMode('HTML'))

export const composer = bot.errorBoundary(errorHandler)
composer.use(addLoggerToContext)
composer.use(addTrackerToContext)
composer.use(i18nMiddleware)
composer.use(identifyUser)

composer.use(privateChats)
composer.use(groupsAndChannels)

const messagesComposer = composer.on([
  'message:text',
  'channel_post:text',
  'channel_post:caption',
  'message:caption',
  'message:file',
  'channel_post:file',
])
messagesComposer.chatType(['group', 'supergroup']).use(checkMentionMode)
messagesComposer
  .chatType(['private', 'channel', 'group', 'supergroup'])
  .use(onlyActiveChat)
  .use(messageHandler)

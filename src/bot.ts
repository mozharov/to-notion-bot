import {Bot, Composer} from 'grammy'
import {ConfigService} from './config/config.service'
import {Context} from './context'
import {startComposer} from './start/start.composer'
import {i18nComposer} from './i18n/i18n.composer'
import {errorsHandler} from './errors/errors.handler'
import {sessionComposer} from './session/session.composer'
import {conversationComposer} from './conversation/conversation.composer'
import {chatsComposer} from './chats/chats.composer'

export const bot = new Bot<Context>(ConfigService.botToken, {
  botInfo: ConfigService.botInfo,
})

const composer = new Composer<Context>()

composer.use(sessionComposer)
composer.use(i18nComposer)
composer.use(conversationComposer)

composer.use(startComposer)
composer.use(chatsComposer)

bot.errorBoundary(errorsHandler).use(composer)

import {Bot, Composer} from 'grammy'
import {ConfigService} from './config/config.service'
import {Context} from './context'
import {startComposer} from './start/start.composer'
import {i18nComposer} from './i18n/i18n.composer'
import {configComposer} from './config/config.composer'
import {chatsComposer} from './chats/chats.composer'
import {usersComposer} from './users/users.composer'
import {errorsHandler} from './errors/errors.handler'
import {sessionComposer} from './session/session.composer'

export const bot = new Bot<Context>(ConfigService.botToken, {
  botInfo: ConfigService.botInfo,
})

const composer = new Composer<Context>()

composer.use(configComposer)
composer.use(sessionComposer)
composer.use(chatsComposer)
composer.use(i18nComposer)
composer.use(usersComposer)
composer.use(startComposer)

bot.errorBoundary(errorsHandler).use(composer)

import {Context as GrammyContext} from 'grammy'
import {I18nFlavor} from '@grammyjs/i18n'
import {UsersFlavor} from './users/users.context'
import {ChatsFlavor} from './chats/chats.context'
import {ConfigFlavor} from './config/config.context'

export type Context = GrammyContext & ConfigFlavor & I18nFlavor & UsersFlavor & ChatsFlavor

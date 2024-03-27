import {Context as GrammyContext} from 'grammy'
import {I18nFlavor} from '@grammyjs/i18n'
import {SessionFlavor} from './session/session.context'
import {ConversationFlavor} from '@grammyjs/conversations'

export type Context = GrammyContext & I18nFlavor & SessionFlavor & ConversationFlavor

import {I18n} from '@grammyjs/i18n'
import {Context} from '../context'
import {Composer} from 'grammy'

export const i18nComposer = new Composer<Context>()

i18nComposer.use(
  new I18n<Context>({
    defaultLocale: 'en',
    directory: 'src/i18n/locales',
    localeNegotiator: ctx => ctx.chatEntity?.languageCode ?? ctx.from?.language_code ?? 'en',
  }),
)

import {I18n} from '@grammyjs/i18n'
import {Context} from '../context'
import {Composer} from 'grammy'
import {ChatsService} from '../chats/chats.service'

export const i18nComposer = new Composer<Context>()

export const i18n = new I18n<Context>({
  defaultLocale: 'en',
  directory: 'src/i18n/locales',
  localeNegotiator: async ctx => {
    const chatsService = new ChatsService()
    const chat = ctx.chat?.id ? await chatsService.getChatByTelegramId(ctx.chat.id) : null
    return chat?.languageCode ?? ctx.from?.language_code ?? 'en'
  },
})

i18nComposer.use(i18n)

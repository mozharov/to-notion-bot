import {I18n} from '@grammyjs/i18n'
import {Context} from '../context'
import {Composer} from 'grammy'
import {chatsService} from '../chats/chats.service'
import path from 'path'

export const i18n = new I18n<Context>({
  defaultLocale: 'en',
  directory: path.resolve(__dirname, 'locales'),
  localeNegotiator: async ctx => {
    const chat = ctx.chat?.id ? await chatsService.findChatByTelegramId(ctx.chat.id) : null
    if (ctx.chat?.type === 'private') return ctx.from?.language_code ?? 'en'
    return chat?.languageCode ?? (ctx.from?.language_code || 'en')
  },
})

export const i18nComposer = new Composer<Context>()
i18nComposer.use(i18n)
i18nComposer.use((ctx, next) => {
  const translate = ctx.translate
  ctx.translate = (key, variables) => {
    return translate(key, variables).replace(/[\u2068\u2069]/g, '')
  }
  ctx.t = ctx.translate
  return next()
})

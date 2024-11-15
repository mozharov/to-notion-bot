import {Composer, InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {analytics} from '../analytics/analytics.service'

export const donateComposer = new Composer<Context>()

donateComposer
  .chatType('private')
  .command('donate')
  .use(async ctx => {
    analytics.track('donate command', ctx.from.id)
    const language = await ctx.i18n.getLocale()
    const donateLink =
      language === 'ru'
        ? 'https://t.me/tribute/app?startapp=deFb'
        : 'https://t.me/tribute/app?startapp=deFX'
    const keyboard = new InlineKeyboard().add({url: donateLink, text: ctx.t('donate.link')})
    await ctx.reply(ctx.t('donate'), {parse_mode: 'HTML', reply_markup: keyboard})
  })

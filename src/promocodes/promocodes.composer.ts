import {Composer, InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {MAX_LENGTH_CODE} from './entities/promocode.entity'
import {promocodesService} from './promocodes.service'
import {isAdmin} from '../users/users.filters'
import {createConversation} from '@grammyjs/conversations'
import {creatingPromocode, generatingPromocode} from './promocodes.conversations'
import {LoggerService} from '../logger/logger.service'
import {subscriptionsService} from '../subscriptions/subscriptions.service'
import {usersService} from '../users/users.service'

const logger = new LoggerService('PromocodesComposer')

export const promocodesComposer = new Composer<Context>()

promocodesComposer
  .chatType('private')
  .command('create_promocode')
  .use(async (ctx, next) => {
    logger.debug('Exiting conversation')
    await ctx.conversation.exit()
    return next()
  })
promocodesComposer
  .chatType('private')
  .callbackQuery(/^promocode:(cancel|generate)$/)
  .use(async (ctx, next) => {
    logger.debug('Exiting conversation')
    await ctx.conversation.exit()
    return next()
  })

promocodesComposer
  .use(createConversation(creatingPromocode))
  .use(createConversation(generatingPromocode))

const privateChats = promocodesComposer.chatType('private')
privateChats.on('message:text').use(async (ctx, next) => {
  if (ctx.message.text.length > MAX_LENGTH_CODE) return next()
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const promocode = await promocodesService.findActivePromocode(ctx.message.text, user)
  if (!promocode) return next()

  await promocodesService.activatePromocode(promocode, user)
  await subscriptionsService.giveDaysToUser(user, promocode.freeDays)
  promocode.used += 1
  await promocode.save()

  const keyboard = new InlineKeyboard().add({
    callback_data: 'subscribe',
    text: ctx.t('promocode.status'),
  })
  await ctx.reply(ctx.t('promocode', {days: promocode.freeDays}), {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  })
})

const onlyAdmin = privateChats.filter(isAdmin)
onlyAdmin
  .callbackQuery('promocode:cancel')
  .use(ctx => ctx.editMessageText(ctx.t('promocode.canceled')))
onlyAdmin.callbackQuery('promocode:generate').use(async ctx => {
  await ctx.editMessageText(ctx.t('promocode.generating'))
  await ctx.conversation.enter(generatingPromocode.name, {overwrite: true})
})
onlyAdmin
  .command('create_promocode')
  .use(ctx => ctx.conversation.enter(creatingPromocode.name, {overwrite: true}))
onlyAdmin.command('promocodes').use(async ctx => {
  const promocodes = await promocodesService.getPromocodes()

  await ctx.reply(
    `${ctx.t('promocode.list')}\n${promocodes
      .map(
        promocode =>
          `<code>${promocode.code}</code> - ${promocode.freeDays} days - ${promocode.maxUses} uses - ${promocode.used} used`,
      )
      .join('\n')}`,
    {parse_mode: 'HTML'},
  )
})
onlyAdmin.hears(/^\/delete_promocode ([a-zA-Z0-9_-]+)$/).use(async ctx => {
  const code = ctx.match[1] ?? ''
  const promocode = code ? await promocodesService.findPromocode(code) : null
  await promocode?.remove()
  await ctx.reply(ctx.t('promocode.deleted', {code}), {parse_mode: 'HTML'})
})

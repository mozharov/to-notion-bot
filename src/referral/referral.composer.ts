import {Composer, InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {referralService} from './referral.service'
import {usersService} from '../users/users.service'
import {LoggerService} from '../logger/logger.service'
import {subscriptionsService} from '../subscriptions/subscriptions.service'

const logger = new LoggerService('ReferralComposer')

export const referralComposer = new Composer<Context>()

const privateChat = referralComposer.chatType('private')

privateChat.command('referral').use(async ctx => {
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const referral = await referralService.getOrCreateReferral(user)
  const newUsers = await referralService.countReferralsByReferrerCode(referral.code)
  await ctx.reply(
    ctx.t('referral', {
      code: referral.code,
      bot: ctx.me.username,
      newUsers,
      launchesCount: referral.launchesCount,
      months: referral.monthsCount,
    }),
    {parse_mode: 'HTML', link_preview_options: {is_disabled: true}},
  )
})

privateChat.command('start').use(async (ctx, next) => {
  const code = ctx.message.text?.split(' ')[1]
  const referrer = code ? await referralService.findReferrerByCode(code) : null
  if (referrer && referrer.owner.telegramId !== ctx.from.id) {
    referrer.launchesCount += 1
    await referrer.save()
  }

  const userExists = await usersService.existsUserByTelegramId(ctx.from.id)
  if (!userExists) {
    logger.debug('New user', {code})
    const user = await usersService.getOrCreateUser(ctx.from.id)
    const referral = await referralService.getOrCreateReferral(user)
    if (referral.referrerCode) {
      logger.error('Referrer code already exists', {
        referral,
      })
      return next()
    }

    let months: number
    if (!referrer) {
      const ONE_MONTH = 30
      await subscriptionsService.giveDaysToUser(user, ONE_MONTH)
      months = 1
    } else {
      referral.referrerCode = referrer.code
      const TWO_MONTHS = 60
      await Promise.all([referral.save(), subscriptionsService.giveDaysToUser(user, TWO_MONTHS)])
      months = 2
    }

    const keyboard = new InlineKeyboard().add({
      callback_data: 'subscribe',
      text: ctx.t('new-user.status'),
    })
    await ctx.reply(ctx.t('new-user', {months}), {
      reply_markup: keyboard,
      parse_mode: 'HTML',
    })
  }
  return next()
})

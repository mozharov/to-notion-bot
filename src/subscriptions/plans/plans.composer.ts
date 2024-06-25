import {Composer, InlineKeyboard} from 'grammy'
import {Context} from '../../context'
import {isAdmin} from '../../users/users.filters'
import {settingPrice} from './plans.conversations'
import {plansService} from './plans.service'
import {usersService} from '../../users/users.service'
import {createConversation} from '@grammyjs/conversations'
import {paymentsService} from '../../payments/payments.service'
import {subscriptionsService} from '../subscriptions.service'
import {referralService} from '../../referral/referral.service'
import {LoggerService} from '../../logger/logger.service'
import {analytics} from '../../analytics/analytics.service'

const logger = new LoggerService('PlansComposer')

export const plansComposer = new Composer<Context>()

plansComposer.on('pre_checkout_query', async ctx => {
  await ctx.answerPreCheckoutQuery(true)
})

plansComposer.on('message:successful_payment', async ctx => {
  analytics.track('successful payment', ctx.from.id)
  const payment = await paymentsService.findById(ctx.message.successful_payment.invoice_payload)
  if (!payment) throw new Error('Payment not found')

  const days = payment.plan.name === 'month' ? 30 : 360
  await subscriptionsService.giveDaysToUser(payment.user, days)
  payment.status = 'completed'
  await payment.save()

  await ctx
    .reply(
      ctx.t('pay-success', {
        hasReceipt: 'false',
      }),
      {parse_mode: 'HTML'},
    )
    .catch(logger.error)
  const referral = await referralService.getOrCreateReferral(payment.user)
  if (referral.referrerCode) {
    const referrer = await referralService.findReferrerByCode(referral.referrerCode)
    if (referrer) {
      await subscriptionsService.giveDaysToUser(referrer.owner, days)
      referrer.monthsCount += payment.plan.name === 'month' ? 1 : 12
      await referrer.save()
    }
  }
})

plansComposer
  .chatType('private')
  .callbackQuery('set-price:cancel')
  .filter(isAdmin)
  .use(async ctx => {
    await ctx.conversation.exit()
    await ctx.deleteMessage()
    await ctx.reply(ctx.t('set-price.cancelled'))
  })

plansComposer.use(createConversation(settingPrice))

const privateChats = plansComposer.chatType('private')
const onlyAdmin = privateChats.filter(isAdmin)

onlyAdmin.command('set_price').use(async ctx => {
  await ctx.conversation.enter(settingPrice.name, {overwrite: true})
})

privateChats.callbackQuery(/^plan:(month|year)$/).use(async ctx => {
  const planName = String(ctx.callbackQuery.data.split(':')[1]) as 'month' | 'year'
  analytics.track('plan callback', ctx.from.id, {plan})
  const plan = await plansService.findPlanByname(planName)
  if (!plan) throw new Error('Plan not found')
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const description = ctx.t('plan.description', {months: planName === 'month' ? 1 : 12})

  const payment = await paymentsService.createPayment({
    amount: plan.amount,
    user,
    plan,
  })

  await ctx.replyWithInvoice(ctx.t('plan.title'), description, payment.id, 'XTR', [
    {
      label: description,
      amount: plan.amount,
    },
  ])
})

privateChats.callbackQuery('plans').use(async ctx => {
  analytics.track('plans callback', ctx.from.id)
  const plans = await plansService.getPlans()
  const keyboard = new InlineKeyboard()
  for (const plan of plans) {
    keyboard.text(
      ctx.t('plan.months', {
        months: plan.name === 'month' ? 1 : 12,
        price: plan.amount,
      }),
      `plan:${plan.name}`,
    )
  }
  await ctx.editMessageText(ctx.t('plan'), {
    reply_markup: keyboard,
    parse_mode: 'HTML',
  })
})

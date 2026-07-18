import {CallbackQueryMiddleware, type Context} from 'grammy'
import {getOrCreateUser} from '../../../models/users.js'
import {isUserHasLifetimeAccess} from '../../helpers/user.js'
import {createInvoice} from '../../../models/invoices.js'
import {config} from '../../../config.js'
import type {Invoice} from '../../../models/invoices.js'

type SubscriptionPlan = NonNullable<Invoice['period']>

function getStarsPrice(plan: SubscriptionPlan): number {
  if (plan === 'month') return config.subscriptionMonthlyPriceStars
  if (plan === 'year') return config.subscriptionYearlyPriceStars
  return config.subscriptionLifetimePriceStars
}

function getInvoiceLabel(plan: SubscriptionPlan): string {
  if (plan === 'month') return 'Monthly subscription'
  if (plan === 'year') return 'Yearly subscription'
  return 'Lifetime access'
}

export const payTelegramStarsCallback: CallbackQueryMiddleware<Context> = async ctx => {
  const {plan} = parseMatch(ctx.match)
  ctx.tracker.capture('pay telegram stars callback', {plan})
  const user = await getOrCreateUser(ctx.from.id)
  if (isUserHasLifetimeAccess(user)) {
    ctx.tracker.capture('pay telegram stars blocked, already has lifetime')
    await ctx.reply(ctx.t('subscription.already-has'))
    return
  }

  const amount = getStarsPrice(plan)
  const invoice = await createInvoice({
    amount,
    currency: 'XTR',
    period: plan,
    userId: user.id,
  })
  await ctx.replyWithInvoice(
    ctx.t('subscription.title', {plan}),
    ctx.t('subscription.description', {plan}),
    invoice.id,
    'XTR',
    [{amount, label: getInvoiceLabel(plan)}],
  )
  ctx.tracker.capture('invoice sent', {plan, amount})
}

function parseMatch(match: string | RegExpMatchArray): {plan: SubscriptionPlan} {
  const [, plan] = match
  if (plan !== 'month' && plan !== 'year' && plan !== 'lifetime') throw new Error('Invalid plan')
  return {plan}
}

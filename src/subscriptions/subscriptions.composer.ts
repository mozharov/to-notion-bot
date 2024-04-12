import {Composer, InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {usersService} from '../users/users.service'
import {plansService} from './plans/plans.service'
import {walletService} from '../wallet/wallet.service'
import {giveSubscription} from './subscriptions.actions'
import {subscriptionsService} from './subscriptions.service'

export const subscriptionsComposer = new Composer<Context>()

const privateChat = subscriptionsComposer.chatType('private')

privateChat
  .command(['subscribe', 'subscription', 'subscriptions', 'membership'])
  .use(giveSubscription)

privateChat.callbackQuery('subscribe').use(ctx => giveSubscription(ctx))

privateChat
  .callbackQuery(
    /^subscribe:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/,
  )
  .use(async ctx => {
    const planId = String(ctx.callbackQuery.data.split(':')[1])
    const plan = await plansService.findPlanById(planId)
    if (!plan) throw new Error('Plan not found')
    const user = await usersService.getOrCreateUser(ctx.from.id)
    const description = ctx.t('plan.description', {months: plan.months})
    const walletPaymentUrl = await walletService.createOrder(plan.price, description, user, plan)
    const keyboard = new InlineKeyboard()
      .add({
        url: walletPaymentUrl,
        text: ctx.t('plan.pay-wallet'),
      })
      .add({
        url: 'https://tinkof.pay',
        text: ctx.t('plan.pay-card'),
      })

    await ctx.editMessageText(ctx.t('plan.pay', {price: plan.dollars}), {
      reply_markup: keyboard,
      parse_mode: 'HTML',
    })
  })

privateChat.command('start').use(async (ctx, next) => {
  const user = await usersService.findUserByTelegramId(ctx.from.id)
  if (!user) {
    const user = await usersService.getOrCreateUser(ctx.from.id)
    await subscriptionsService.giveDaysToUser(user, 30)
    const keyboard = new InlineKeyboard().add({
      callback_data: 'subscribe',
      text: ctx.t('new-user.status'),
    })
    await ctx.reply(ctx.t('new-user'), {
      reply_markup: keyboard,
      parse_mode: 'HTML',
    })
  }
  return next()
})

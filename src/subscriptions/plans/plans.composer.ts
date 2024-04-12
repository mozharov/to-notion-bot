import {Composer, InlineKeyboard} from 'grammy'
import {Context} from '../../context'
import {isAdmin} from '../../users/users.filters'
import {settingPrice} from './plans.conversations'
import {plansService} from './plans.service'
import {usersService} from '../../users/users.service'
import {walletService} from '../../wallet/wallet.service'
import {createConversation} from '@grammyjs/conversations'

export const plansComposer = new Composer<Context>()

plansComposer.use(createConversation(settingPrice))

const privateChats = plansComposer.chatType('private')
const onlyAdmin = privateChats.filter(isAdmin)

onlyAdmin.command('set_price').use(async ctx => {
  await ctx.conversation.enter(settingPrice.name, {overwrite: true})
})

onlyAdmin.callbackQuery('set-price:cancel').use(async ctx => {
  await ctx.conversation.exit()
  await ctx.deleteMessage()
})

privateChats.callbackQuery(/^plan:(month|year)$/).use(async ctx => {
  const planName = String(ctx.callbackQuery.data.split(':')[1]) as 'month' | 'year'
  const plan = await plansService.getPlanByName(planName)
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const description = ctx.t('plan.description', {months: planName === 'month' ? 1 : 12})
  const walletPaymentUrl = await walletService.createOrder(plan.cents, description, user, plan)
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

privateChats.callbackQuery('plans').use(async ctx => {
  const plans = await plansService.getPlans()
  const keyboard = new InlineKeyboard()
  for (const plan of plans) {
    keyboard.text(
      ctx.t('plan.months', {
        months: plan.name === 'month' ? 1 : 12,
        price: plan.dollars,
      }),
      `plan:${plan.name}`,
    )
  }
  await ctx.editMessageText(ctx.t('plan'), {
    reply_markup: keyboard,
    parse_mode: 'HTML',
  })
})

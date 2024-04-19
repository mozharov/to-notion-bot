import {Composer, InlineKeyboard} from 'grammy'
import {Context} from '../../context'
import {isAdmin} from '../../users/users.filters'
import {settingPrice} from './plans.conversations'
import {plansService} from './plans.service'
import {usersService} from '../../users/users.service'
import {walletService} from '../../wallet/wallet.service'
import {createConversation} from '@grammyjs/conversations'
import {tinkoffService} from '../../tinkoff/tinkoff.service'
import {config} from '../../config/config.service'
import {cryptoBotService} from '../../crypto-bot/crypto-bot.service'

export const plansComposer = new Composer<Context>()

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
  const plan = await plansService.findPlanByname(planName)
  if (!plan) throw new Error('Plan not found')
  const user = await usersService.getOrCreateUser(ctx.from.id)
  const description = ctx.t('plan.description', {months: planName === 'month' ? 1 : 12})
  const language = (await ctx.i18n.getLocale()) as 'ru' | 'en'

  const keyboard = new InlineKeyboard()
  if (config.get('WALLET_API_KEY')) {
    const walletPaymentUrl = await walletService.createOrder(description, user, plan)
    keyboard.row().add({
      url: walletPaymentUrl,
      text: ctx.t('plan.pay-wallet'),
    })
  }
  if (config.get('TINKOFF_TERMINAL_KEY') && config.get('TINKOFF_TERMINAL_PASSWORD')) {
    const tinkoffPaymentUrl = await tinkoffService.createOrder(user, plan, description, language)
    keyboard.row().add({
      url: tinkoffPaymentUrl,
      text: ctx.t('plan.pay-card'),
    })
  }
  if (config.get('CRYPTO_BOT_API_KEY')) {
    const invoiceUrl = await cryptoBotService.createInvoice(description, user, plan)
    keyboard.row().add({
      url: invoiceUrl,
      text: ctx.t('plan.pay-crypto'),
    })
  }

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

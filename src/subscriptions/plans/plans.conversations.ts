import {InlineKeyboard} from 'grammy'
import {Context} from '../../context'
import {Conversation} from '../../conversation/conversation.composer'
import {plansService} from './plans.service'

export async function settingPrice(conversation: Conversation, ctx: Context): Promise<void> {
  const otherwise = async (ctx: Context): Promise<void> => {
    const keyboard = new InlineKeyboard().add({
      text: ctx.t('set-price.cancel'),
      callback_data: 'set-price:cancel',
    })
    await ctx.reply(ctx.t('set-price.int-invalid'), {reply_markup: keyboard})
    await conversation.skip({drop: true})
    return
  }

  await ctx.reply(ctx.t('set-price', {period: 'month', currency: 'USD'}), {parse_mode: 'HTML'})
  const monthlyPriceCents = await conversation.form.int({otherwise})
  await ctx.reply(ctx.t('set-price', {period: 'month', currency: 'RUB'}), {parse_mode: 'HTML'})
  const monthlyPriceKopecks = await conversation.form.int({otherwise})
  await ctx.reply(ctx.t('set-price', {period: 'year', currency: 'USD'}), {parse_mode: 'HTML'})
  const yearlyPriceCents = await conversation.form.int({otherwise})
  await ctx.reply(ctx.t('set-price', {period: 'year', currency: 'RUB'}), {parse_mode: 'HTML'})
  const yearlyPriceKopecks = await conversation.form.int({otherwise})
  await Promise.all([
    plansService.setPriceForYearlyPlan(yearlyPriceCents, yearlyPriceKopecks),
    plansService.setPriceForMonthlyPlan(monthlyPriceCents, monthlyPriceKopecks),
  ])
  await ctx.reply(ctx.t('set-price.success'))
}

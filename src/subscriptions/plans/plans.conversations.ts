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

  await ctx.reply(ctx.t('set-price', {period: 'month'}), {parse_mode: 'HTML'})
  const monthlyPrice = await conversation.form.int({otherwise})
  await ctx.reply(ctx.t('set-price', {period: 'year'}), {parse_mode: 'HTML'})
  const yearlyPrice = await conversation.form.int({otherwise})
  await Promise.all([
    plansService.setPriceForMonthlyPlan(monthlyPrice),
    plansService.setPriceForYearlyPlan(yearlyPrice),
  ])
  await ctx.reply(ctx.t('set-price.success'))
}

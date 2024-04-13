import {InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {Conversation} from '../conversation/conversation.composer'
import {MAX_LENGTH_CODE, Promocode} from './entities/promocode.entity'
import {promocodesService} from './promocodes.service'
import {LoggerService} from '../logger/logger.service'
import {nanoid} from 'nanoid'

const logger = new LoggerService('PromocodeConversations')

export async function creatingPromocode(conversation: Conversation, ctx: Context): Promise<void> {
  logger.info('Creating promocode')
  const code = await waitForCode(conversation, ctx)
  const freeDays = await waitForFreeDays(conversation, ctx)
  const maxUses = await waitForMaxUses(conversation, ctx)
  await createPromocode(ctx, {code, freeDays, maxUses})
}

export async function generatingPromocode(conversation: Conversation, ctx: Context): Promise<void> {
  logger.info('Generating promocode')
  const code = await conversation.external(() => nanoid(10).toUpperCase())
  const freeDays = await waitForFreeDays(conversation, ctx)
  const maxUses = await waitForMaxUses(conversation, ctx)
  await createPromocode(ctx, {code, freeDays, maxUses})
}

async function createPromocode(
  ctx: Context,
  data: {code: Promocode['code']; freeDays: Promocode['freeDays']; maxUses: Promocode['maxUses']},
): Promise<void> {
  await promocodesService.createPromocode(data)
  await ctx.reply(ctx.t('promocode.created', data), {parse_mode: 'HTML'})
}

async function waitForMaxUses(conversation: Conversation, ctx: Context): Promise<number> {
  await ctx.reply(ctx.t('promocode.max-uses'))
  const maxUses = await conversation.form.int({
    otherwise: async ctx => {
      const keyboard = new InlineKeyboard().add({
        text: ctx.t('promocode.cancel'),
        callback_data: 'promocode:cancel',
      })
      await ctx.reply(ctx.t('promocode.invalid-max-uses'), {reply_markup: keyboard})
      return conversation.skip({drop: true})
    },
  })
  return maxUses
}

async function waitForFreeDays(conversation: Conversation, ctx: Context): Promise<number> {
  await ctx.reply(ctx.t('promocode.days'))
  const freeDays = await conversation.form.int({
    otherwise: async ctx => {
      const keyboard = new InlineKeyboard().add({
        text: ctx.t('promocode.cancel'),
        callback_data: 'promocode:cancel',
      })
      await ctx.reply(ctx.t('promocode.invalid-days'), {reply_markup: keyboard})
      return conversation.skip({drop: true})
    },
  })
  return freeDays
}

async function waitForCode(conversation: Conversation, ctx: Context): Promise<string> {
  const keyboard = new InlineKeyboard()
    .add({
      text: ctx.t('promocode.generate'),
      callback_data: 'promocode:generate',
    })
    .row()
    .add({
      text: ctx.t('promocode.cancel'),
      callback_data: 'promocode:cancel',
    })
  await ctx.reply(ctx.t('promocode.new'), {reply_markup: keyboard})
  const code = await conversation.form.text()
  if (code.length > MAX_LENGTH_CODE) {
    const keyboard = new InlineKeyboard().add({
      text: ctx.t('promocode.cancel'),
      callback_data: 'promocode:cancel',
    })
    await ctx.reply(ctx.t('promocode.invalid'), {reply_markup: keyboard})
    await conversation.skip({drop: true})
  }
  const promocode = await conversation.external(() => promocodesService.findPromocode(code))
  if (promocode) {
    await ctx.reply(ctx.t('promocode.exists'))
    await conversation.skip({drop: true})
  }
  return code.toUpperCase()
}

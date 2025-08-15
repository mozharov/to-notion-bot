import type {CommandContext, Context, Middleware} from 'grammy'
import {createPromocode} from '../../../models/promocodes.js'
import {randomUUID} from 'crypto'
import {config} from '../../../config.js'

export const promocodeCommand: Middleware<CommandContext<Context>> = async ctx => {
  ctx.tracker.capture('promocode command')
  const {code, days, uses} = parseMatch(ctx.match)
  const promocode = code ? code.toUpperCase() : randomUUID().slice(0, 6).toUpperCase()
  try {
    await createPromocode(promocode, days, uses)
  } catch (error) {
    if (error instanceof Error && error.message === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      return ctx.reply(ctx.t('promocode.already-exists'))
    }
    throw error
  }
  return ctx.reply(ctx.t('promocode', {code: promocode, days, uses}))
}

function parseMatch(match: string) {
  const [days, uses, code] = match.split(' ')
  if (!days || !uses || (code && code.length > config.MAX_PROMOCODE_LENGTH)) {
    throw new Error('Invalid match')
  }
  const daysNumber = Number(days)
  const usesNumber = Number(uses)
  if (
    isNaN(daysNumber) ||
    isNaN(usesNumber) ||
    daysNumber < -1 ||
    usesNumber < -1 ||
    daysNumber === 0 ||
    usesNumber === 0
  ) {
    throw new Error('Invalid match')
  }
  return {code, days: daysNumber, uses: usesNumber}
}

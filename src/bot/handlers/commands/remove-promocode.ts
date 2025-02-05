import type {CommandContext, Context, Middleware} from 'grammy'
import {deletePromocode} from '../../../models/promocodes.js'

export const removePromocodeCommand: Middleware<CommandContext<Context>> = async ctx => {
  ctx.tracker.capture('remove_promocode command')
  const {code} = parseMatch(ctx.match)
  await deletePromocode(code)
  return ctx.reply(ctx.t('promocode.removed'))
}

function parseMatch(match: string) {
  const [code] = match
  if (!code) throw new Error('Invalid match')
  return {code}
}

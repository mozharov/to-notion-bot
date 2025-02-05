import {ChatTypeContext, Context, Middleware} from 'grammy'
import {deletePromocode, getPromocode, updatePromocode} from '../../models/promocodes.js'
import {getOrCreateUser, updateUser} from '../../models/users.js'
import {config} from '../../config.js'
import {createPromocodeUser, getPromocodeUser} from '../../models/promocodes-users.js'

export const checkPromocode: Middleware<ChatTypeContext<Context, 'private'>> = async (
  ctx,
  next,
) => {
  const code = ctx.message?.text
  if (code && code.length <= config.MAX_PROMOCODE_LENGTH) {
    const result = await applyPromocode(code, ctx.from.id)
    if (result) {
      ctx.tracker.capture('promocode applied', {code: result.code})
      await ctx.reply(
        ctx.t('promocode.applied', {
          code: result.code,
          endsAt: result.subscriptionEndsAt ? result.subscriptionEndsAt : '∞',
        }),
      )
      return
    }
  }
  return next()
}

async function applyPromocode(code: string, tgUserId: number) {
  const promocode = await getPromocode(code)
  if (!promocode || (promocode.usesLeft !== -1 && promocode.usesLeft <= 0)) {
    return null
  }

  const user = await getOrCreateUser(tgUserId)

  const promocodeUser = await getPromocodeUser(code, user.id)
  if (promocodeUser) return null
  await createPromocodeUser(code, user.id)

  if (promocode.usesLeft !== -1) {
    if (promocode.usesLeft === 1) await deletePromocode(code)
    else await updatePromocode(code, {usesLeft: promocode.usesLeft - 1})
  }

  const subscriptionEndsAt = calculateSubscriptionEndDate(
    user.subscriptionEndsAt,
    promocode.givesDays,
  )
  await updateUser(user.id, {subscriptionEndsAt, leftMessages: -1})
  return {subscriptionEndsAt, code}
}

function calculateSubscriptionEndDate(currentEndDate: Date | null, giveDays: number) {
  if (giveDays === -1) return null

  const startDate = currentEndDate ?? new Date()
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + giveDays)
  return endDate
}

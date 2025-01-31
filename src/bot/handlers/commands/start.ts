import type {ChatTypeContext, Context, Middleware} from 'grammy'
import {getChatsByOwnerTelegramId} from '../../../models/chats.js'
import {buildChatsKeyboard} from '../../helpers/keyboards/chats.js'
import {getOrCreateUser} from '../../../models/users.js'

export const startCommand: Middleware<ChatTypeContext<Context, 'private'>> = async ctx => {
  const startParam = ctx.match

  if (startParam === 'lifetime_subscription') {
    ctx.tracker.capture('start command with lifetime subscription')
    await ctx.reply(ctx.t('subscription'))
    return
  }

  ctx.tracker.capture('start command')
  await ctx.reply(ctx.t('start'), {link_preview_options: {is_disabled: true}})

  await getOrCreateUser(ctx.from.id)

  const chats = await getChatsByOwnerTelegramId(ctx.from.id)
  const keyboard = buildChatsKeyboard(ctx.t, chats)
  await ctx.reply(ctx.t('chats'), {reply_markup: keyboard})
}

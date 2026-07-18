import type {Middleware} from 'grammy'
import {getChatByTelegramId} from '../../models/chats.js'
import {isUserHasLifetimeAccess} from '../helpers/user.js'

export const identifyUser: Middleware = async (ctx, next) => {
  if (!ctx.from) return next()
  const chat = await getChatByTelegramId(ctx.from.id)
  const owner = chat?.owner
  ctx.tracker.identify({
    language_code: ctx.from.language_code,
    telegram_premium: ctx.from.is_premium,
    first_name: ctx.from.first_name,
    last_name: ctx.from.last_name,
    username: ctx.from.username,
    left_messages: owner?.leftMessages,
    is_blocked: owner ? owner.leftMessages === 0 : undefined,
    has_lifetime_access: owner ? isUserHasLifetimeAccess(owner) : undefined,
    subscription_ends_at: owner?.subscriptionEndsAt?.toISOString(),
    signed_up_at: owner?.createdAt.toISOString(),
    has_notion_workspace: chat ? !!chat.notionWorkspaceId : undefined,
    private_chat_status: chat?.status,
    private_chat_bot_status: chat?.botStatus,
    private_chat_language_code: chat?.languageCode,
  })
  return next()
}

import {NextFunction} from 'grammy'
import {chatsService} from '../chats/chats.service'
import {Context} from '../context'

export async function onlyActiveChat(ctx: Context, next: NextFunction): Promise<void> {
  if (!ctx.chat) return
  const isActive = await chatsService.isActiveByTelegramId(ctx.chat.id)
  if (!isActive) {
    if (ctx.chat.type === 'private') {
      await ctx.reply(ctx.t('chat-is-not-active'), {parse_mode: 'HTML'})
    }
    return
  }
  return next()
}

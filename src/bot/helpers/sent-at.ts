import type {Context} from 'grammy'

export function getSentAt(ctx: Context): number {
  const sentAt = ctx.message?.date ?? ctx.channelPost?.date
  if (!sentAt) throw new Error('No sentAt found in the context')
  return sentAt
}

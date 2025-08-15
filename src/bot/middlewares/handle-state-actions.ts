import type {Context} from 'grammy'
import type {ChatTypeContext, Middleware} from 'grammy'
import {clearState, getState} from '../services/session.js'
import {
  linkToDatabaseAction,
  type LinkToDatabaseParams,
} from '../handlers/actions/link-to-database.js'
import {feedbackAction} from '../handlers/actions/feedback.js'

export const handleStateActions: Middleware<ChatTypeContext<Context, 'private'>> = async (
  ctx,
  next,
) => {
  const state = await getState(ctx.from.id)
  if (!state) return next()
  const {action, ...others} = state
  const params = others as unknown

  if (action === 'link-to-database') {
    return linkToDatabaseAction(ctx, params as LinkToDatabaseParams, next)
  } else if (action === 'feedback') {
    return feedbackAction(ctx, next)
  } else await clearState(ctx.from.id)

  return next()
}

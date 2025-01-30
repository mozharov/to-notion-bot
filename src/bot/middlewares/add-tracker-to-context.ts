import type {Middleware} from 'grammy'
import {Tracker} from '../lib/tracker.js'

export const addTrackerToContext: Middleware = (ctx, next) => {
  ctx.tracker = new Tracker(ctx.from?.id.toString())
  return next()
}

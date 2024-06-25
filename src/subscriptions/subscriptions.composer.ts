import {Composer} from 'grammy'
import {Context} from '../context'
import {showSubscriptionStatus} from './subscriptions.actions'
import {analytics} from '../analytics/analytics.service'

export const subscriptionsComposer = new Composer<Context>()

const privateChat = subscriptionsComposer.chatType('private')

privateChat.command(['subscribe', 'subscription', 'subscriptions', 'membership']).use(ctx => {
  analytics.track('subscribe command', ctx.from.id)
  return showSubscriptionStatus(ctx)
})
privateChat.callbackQuery('subscribe').use(ctx => {
  analytics.track('subscribe callback', ctx.from.id)
  return showSubscriptionStatus(ctx)
})

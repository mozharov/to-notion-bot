import {Composer} from 'grammy'
import {Context} from '../context'
import {showSubscriptionStatus} from './subscriptions.actions'

export const subscriptionsComposer = new Composer<Context>()

const privateChat = subscriptionsComposer.chatType('private')

privateChat
  .command(['subscribe', 'subscription', 'subscriptions', 'membership'])
  .use(showSubscriptionStatus)
privateChat.callbackQuery('subscribe').use(showSubscriptionStatus)

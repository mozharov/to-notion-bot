import {bot} from '../../bot.js'

export function getSubscriptionUrl() {
  return `https://t.me/${bot.botInfo.username}?start=subscription`
}

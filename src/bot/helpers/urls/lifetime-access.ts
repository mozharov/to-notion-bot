import {bot} from '../../bot.js'

export function getLifetimeAccessUrl() {
  return `https://t.me/${bot.botInfo.username}?start=lifetime_subscription`
}

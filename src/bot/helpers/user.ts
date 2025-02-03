import type {User} from '../../models/users.js'

export function isUserHasLifetimeAccess(user: User) {
  return user.leftMessages === -1 && !user.subscriptionEndsAt
}

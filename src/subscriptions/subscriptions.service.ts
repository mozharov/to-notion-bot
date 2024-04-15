import {Between, MoreThan, Repository} from 'typeorm'
import {DataSource} from '../typeorm/typeorm.data-source'
import {Subscription} from './entities/subscription.entity'
import {User} from '../users/entities/user.entity'

class SubscriptionsService {
  private readonly repository: Repository<Subscription>

  constructor() {
    this.repository = DataSource.getRepository(Subscription)
  }

  public async getSubscriptionsByEndsAtDay(endsAt: Date): Promise<Subscription[]> {
    const startOfDay = new Date(endsAt)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(endOfDay.getDate() + 1)
    endOfDay.setMilliseconds(endOfDay.getMilliseconds() - 1)
    return this.repository.find({
      where: {endsAt: Between(startOfDay, endOfDay), isActive: true},
      order: {endsAt: 'ASC'},
    })
  }

  public async findActiveSubscriptionByUser(user: User): Promise<Subscription | null> {
    const result = await this.repository.find({
      where: {user: {id: user.id}, isActive: true, endsAt: MoreThan(new Date())},
      order: {endsAt: 'DESC'},
      take: 1,
    })
    return result[0] ?? null
  }

  public async giveDaysToUser(user: User, days: number): Promise<Subscription> {
    const subscription = await this.findActiveSubscriptionByUser(user)
    if (subscription) {
      subscription.endsAt.setDate(subscription.endsAt.getDate() + days)
      return subscription.save()
    }
    const currentDate = new Date()
    return this.createSubscription({
      user,
      endsAt: new Date(currentDate.setDate(currentDate.getDate() + days)),
    })
  }

  private async createSubscription(data: {
    user: Subscription['user']
    endsAt: Subscription['endsAt']
  }): Promise<Subscription> {
    const subscription = new Subscription()
    subscription.user = data.user
    subscription.endsAt = data.endsAt
    return subscription.save()
  }
}

export const subscriptionsService = new SubscriptionsService()

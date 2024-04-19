import {MongoClient} from 'mongodb'
import {LoggerService} from '../logger/logger.service'
import {Bot} from 'grammy'
import {usersService} from '../users/users.service'
import {subscriptionsService} from '../subscriptions/subscriptions.service'
import {config} from '../config/config.service'

const logger = new LoggerService('StartService')

// const UserSchema = new Schema<UserDocument>(
//     {
//       telegramID: {type: String, required: true, unique: true},
//       notionDatabaseID: {type: String, default: null},
//       subscription: {type: SchemaTypes.ObjectId, ref: 'Subscription', unique: true},
//       language: {
//         type: String,
//         enum: Object.values(languages),
//         default: config.defaultLanguage,
//         required: true,
//       },
//     },
//     {timestamps: true}
//   )
// const SubscriptionSchema = new Schema<SubscriptionDocument>(
//     {
//       endDate: {type: Date, required: true},
//     },
//     {timestamps: true}
//   )
// TODO: удалить этот сервис после переноса данных, и удалить переменные из config и deploy config
class StartService {
  private readonly dbUrl: string

  constructor() {
    this.dbUrl = config.get('OLD_BOT_DB_URL')
  }

  public async transferOldSubscriptions(): Promise<void> {
    logger.info('Transfering old subscriptions')
    const client = new MongoClient(this.dbUrl, {authSource: 'prod'})
    logger.info('Connecting to database')
    await client.connect()
    logger.info('Connected to database')
    const db = client.db('prod')
    const usersCollection = db.collection('users')
    const subscriptionsCollection = db.collection('subscriptions')

    const subscriptions = await subscriptionsCollection
      .find(
        {endDate: {$gt: new Date()}},
        {
          projection: {
            endDate: 1,
          },
        },
      )
      .toArray()

    const rawUsers = (await usersCollection
      .find({
        subscription: {$in: subscriptions.map(subscription => subscription._id)},
      })
      .toArray()
      .then((users: any) => {
        return users.map((user: any) => {
          const subscription = subscriptions.find(
            subscription => subscription._id.toString() === user.subscription.toString(),
          )
          if (!subscription) throw new Error('No subscription found')
          return {
            telegramId: Number(user.telegramID),
            endDate: new Date(subscription.endDate),
          }
        })
      })) as [{telegramId: number; endDate: Date}]

    logger.info('Chats found: ' + rawUsers.length)

    const bot = new Bot(config.get('OLD_BOT_TOKEN'))

    const users = await rawUsers.reduce<Promise<{telegramId: number; endDate: Date}[]>>(
      async (acc, user) => {
        const users = await acc
        users.push(user)
        if (user.telegramId > 0) return users
        const members = await bot.api.getChatAdministrators(user.telegramId)
        members.forEach(member => {
          users.push({telegramId: member.user.id, endDate: user.endDate})
        })
        return users
      },
      Promise.resolve([]),
    )
    logger.info('Users found: ' + users.length)

    for (const user of users) {
      const userEntity = await usersService.getOrCreateUser(user.telegramId)
      const days =
        Math.ceil((user.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + 1
      await subscriptionsService.giveDaysToUser(userEntity, days)
      logger.info({days, user})
    }

    logger.info('Transferring completed')

    await bot.api.sendMessage(config.get('ADMIN_TELEGRAM_ID'), 'Transferring completed')
  }
}

export const startService = new StartService()

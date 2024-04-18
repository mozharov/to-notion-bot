import {bot} from '../bot'
import {config} from '../config/config.service'
import {LoggerService} from '../logger/logger.service'
import {paymentsService} from '../payments/payments.service'
import {Plan} from '../subscriptions/plans/entities/plan.entity'
import {User} from '../users/entities/user.entity'
import {utils} from '../utils/utils.service'
import {CreateOrderResponse} from './models/create-order-response.model'

const logger = new LoggerService('WalletService')

class WalletService {
  private readonly apiKey: string

  constructor() {
    this.apiKey = config.get('WALLET_API_KEY') ?? ''
  }

  /**
   * @param description - The description of the order for the user
   * @returns The URL of the payment page
   */
  public async createOrder(description: string, user: User, plan: Plan): Promise<string> {
    const payment = await paymentsService.createPayment({
      amount: plan.cents,
      type: 'wallet',
      user,
      plan,
      currency: 'USD',
    })
    const response = await fetch('https://pay.wallet.tg/wpay/store-api/v1/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Wpay-Store-Api-Key': this.apiKey,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        amount: {
          currencyCode: 'USD',
          amount: plan.dollars.toFixed(2),
        },
        description,
        returnUrl: `https://t.me/${bot.botInfo.username}`,
        failReturnUrl: `https://t.me/${bot.botInfo.username}`,
        externalId: payment.id,
        timeoutSeconds: 10800,
        customerTelegramUserId: user.telegramId,
      }),
    })
    const data = await response.json()

    const order = await utils.transformData(data, CreateOrderResponse)

    logger.debug('Order created', order)
    payment.walletOrderId = order.data.id
    payment.walletOrderNumber = order.data.number
    await payment.save()
    return order.data.payLink
  }
}

export const walletService = new WalletService()

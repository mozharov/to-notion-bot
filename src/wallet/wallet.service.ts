import {bot} from '../bot'
import {ConfigService} from '../config/config.service'
import {LoggerService} from '../logger/logger.service'
import {Payment} from '../payments/entities/payment.entity'
import {paymentsService} from '../payments/payments.service'
import {Plan} from '../subscriptions/plans/entities/plan.entity'
import {User} from '../users/entities/user.entity'
import {validateCreateOrderResponseData} from './wallet.helper'

const logger = new LoggerService('WalletService')

class WalletService {
  private readonly apiKey: string

  constructor() {
    this.apiKey = `${ConfigService.walletApiKey}`
  }

  /**
   * @param amount - The amount of the order in cents.
   * @param description - The description of the order for the user.
   * @returns The URL of the payment page.
   */
  public async createOrder(
    amount: Payment['amount'],
    description: string,
    user: User,
    plan: Plan,
  ): Promise<string> {
    const payment = await paymentsService.createPayment({
      amount,
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
          amount: (amount / 100).toFixed(2),
        },
        description,
        returnUrl: `https://t.me/${bot.botInfo.username}`,
        failReturnUrl: `https://t.me/${bot.botInfo.username}`,
        externalId: payment.id,
        timeoutSeconds: 10800,
        customerTelegramUserId: user.telegramId,
      }),
    })

    const order = await validateCreateOrderResponseData(response.json())

    logger.debug({
      message: 'Order created',
      order,
    })
    payment.walletOrderId = order.data.id
    payment.walletOrderNumber = order.data.number
    await payment.save()
    return order.data.payLink
  }
}

export const walletService = new WalletService()

import {config} from '../config/config.service'
import {LoggerService} from '../logger/logger.service'
import {paymentsService} from '../payments/payments.service'
import {Plan} from '../subscriptions/plans/entities/plan.entity'
import {User} from '../users/entities/user.entity'
import {validateInitOrderResponseData} from './tinkoff.helper'

const logger = new LoggerService('TinkoffService')

class TinkoffService {
  /**
   * @param description - The description of the order for the user
   * @returns The URL of the payment page
   */
  public async createOrder(
    user: User,
    plan: Plan,
    description: string,
    language: 'ru' | 'en',
  ): Promise<string> {
    const payment = await paymentsService.createPayment({
      amount: plan.kopecks,
      currency: 'RUB',
      type: 'card',
      user,
      plan,
    })

    const response = await fetch('https://securepay.tinkoff.ru/v2/Init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        TerminalKey: config.get('TINKOFF_TERMINAL_KEY'),
        Amount: plan.kopecks,
        OrderId: payment.id,
        Language: language,
        Description: description,
      }),
    })

    const order = await validateInitOrderResponseData(response.json())
    if (!order.Success || order.ErrorCode !== '0') {
      logger.error(`Operation rejected`, {order})
      payment.status = 'failed'
      await payment.save()
      throw new Error('Operation rejected')
    }
    if (!order.PaymentURL) throw new Error('Payment URL not found')
    return order.PaymentURL
  }
}

export const tinkoffService = new TinkoffService()

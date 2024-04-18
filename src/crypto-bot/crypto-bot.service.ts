import {botInfo} from '../bot'
import {config} from '../config/config.service'
import {LoggerService} from '../logger/logger.service'
import {paymentsService} from '../payments/payments.service'
import {Plan} from '../subscriptions/plans/entities/plan.entity'
import {User} from '../users/entities/user.entity'

const logger = new LoggerService('CryptoBotService')

class CryptoBotService {
  private readonly apiKey: string
  private readonly apiUrl: string

  constructor() {
    this.apiKey = config.get('CRYPTO_BOT_API_KEY') ?? ''
    this.apiUrl =
      config.get('NODE_ENV') === 'development'
        ? 'https://testnet-pay.crypt.bot/api/'
        : 'https://pay.crypt.bot/api/'
  }

  /**
   * @param description - The description of the order for the user
   * @returns The URL of the invoice
   */
  public async createInvoice(description: string, user: User, plan: Plan): Promise<string> {
    const payment = await paymentsService.createPayment({
      amount: plan.cents,
      plan,
      user,
      currency: 'USD',
      type: 'crypto',
    })
    const body = {
      currency_type: 'fiat',
      fiat: 'USD',
      amount: plan.dollars.toString(),
      description,
      paid_btn_name: 'openBot',
      paid_btn_url: `https://t.me/${botInfo.username}`,
      payload: payment.id,
      allow_comments: true,
      allow_anonymous: true,
      expires_in: 2678400,
    }
    const response = await this.fetch('createInvoice', body)
    if (!('pay_url' in response) || typeof response.pay_url !== 'string') {
      logger.fatal('Failed to create invoice', {response})
      throw new Error('Failed to create invoice')
    }
    return response.pay_url
  }

  private async fetch(method: 'createInvoice', body: unknown): Promise<object> {
    const response = await fetch(this.apiUrl + method, {
      headers: {
        'Crypto-Pay-API-Token': this.apiKey,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(body),
    })
    const data = (await response.json()) as {ok: boolean; error?: unknown; result?: object}
    if (!data.ok || !data.result) throw data
    return data.result
  }
}

export const cryptoBotService = new CryptoBotService()

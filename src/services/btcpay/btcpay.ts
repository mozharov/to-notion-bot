import {config} from '../../config.js'
import got from 'got'
import type {CreateInvoiceArgs, CreateInvoiceResponse, RefundInvoiceResponse} from './types.js'

class BTCPay {
  private readonly apiUrl: string
  private readonly headers: Record<string, string>

  constructor(instanceURL: string, apiKey: string, storeId: string) {
    this.apiUrl = `${instanceURL}/api/v1/stores/${storeId}`
    this.headers = {
      Authorization: `token ${apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  async createInvoice({amount, currency, metadata}: CreateInvoiceArgs) {
    const response = await got
      .post(`${this.apiUrl}/invoices`, {
        headers: this.headers,
        body: JSON.stringify({amount, currency, metadata}),
      })
      .json()
    return response as CreateInvoiceResponse
  }

  async refundInvoice(invoiceId: string) {
    const response = await got
      .post(`${this.apiUrl}/invoices/${invoiceId}/refund`, {
        headers: this.headers,
        body: JSON.stringify({
          refundVariant: 'RateThen',
        }),
      })
      .json()
    return response as RefundInvoiceResponse
  }
}

export const btcpay = new BTCPay(
  config.BTCPAY_INSTANCE_URL,
  config.BTCPAY_API_KEY,
  config.BTCPAY_STORE_ID,
)

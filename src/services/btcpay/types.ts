// Only fields used in the application are listed

export interface CreateInvoiceArgs {
  amount: string
  currency?: string
  metadata?: {
    orderId?: string
    tgUserId?: number
  }
}

export interface CreateInvoiceResponse {
  id: string
  storeId: string
  amount: string
  currency: string
  type: 'Standard' | 'TopUp'
  checkoutLink: string
  createdTime: number
  expirationTime: number
  monitoringExpiration: number
  status: 'New' | 'Processing' | 'Expired' | 'Invalid' | 'Settled'
  additionalStatus: 'None' | 'PaidLate' | 'PaidPartial' | 'Marked' | 'Invalid' | 'PaidOver'
  availableStatusesForManualMarking: ('New' | 'Processing' | 'Expired' | 'Invalid' | 'Settled')[]
  archived: boolean
  metadata?: {
    orderId?: string
    tgUserId?: number
  }
}

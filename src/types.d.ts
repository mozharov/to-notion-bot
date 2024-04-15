declare module 'moy-nalog' {
  type ConstructorParams = {
    login: string
    password: string
    autologin?: boolean
  }
  type AddIncomeParams = {
    date?: Date
    name: string
    quantity?: number
    amount: number
  }
  type AddIncomeResult = {
    id: string
    data: string
    printUrl: string
  }
  type Endpoint = 'cancel' | 'income'

  class NalogAPI {
    constructor(config?: ConstructorParams)
    public addIncome(params: AddIncomeParams): Promise<AddIncomeResult>
    public call(
      endpoint: Endpoint,
      payload: Record<string, unknown>,
      method?: string,
    ): Promise<Record<string, unknown>>
    public dateToLocalISO(date?: Date): string
  }

  export = NalogAPI
}

declare module 'express-async-errors'

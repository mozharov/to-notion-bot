import {Repository} from 'typeorm'
import {DataSource} from '../typeorm/typeorm.data-source'
import {Payment} from './entities/payment.entity'

class PaymentsService {
  private readonly repository: Repository<Payment>

  constructor() {
    this.repository = DataSource.getRepository(Payment)
  }

  public async createPayment(data: {
    amount: Payment['amount']
    type: Payment['type']
    user: Payment['user']
    plan: Payment['plan']
  }): Promise<Payment> {
    const payment = new Payment()
    payment.amount = data.amount
    payment.type = data.type
    payment.user = data.user
    payment.plan = data.plan
    return this.repository.save(payment)
  }
}

export const paymentsService = new PaymentsService()

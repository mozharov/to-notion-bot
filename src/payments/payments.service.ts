import {Repository} from 'typeorm'
import {DataSource} from '../typeorm/typeorm.data-source'
import {Payment} from './entities/payment.entity'

class PaymentsService {
  private readonly repository: Repository<Payment>

  constructor() {
    this.repository = DataSource.getRepository(Payment)
  }

  public async findById(id: Payment['id']): Promise<Payment | null> {
    return this.repository.findOneBy({id})
  }

  public async createPayment(data: {
    amount: Payment['amount']
    user: Payment['user']
    plan: Payment['plan']
  }): Promise<Payment> {
    const payment = new Payment()
    payment.amount = data.amount
    payment.user = data.user
    payment.plan = data.plan
    return this.repository.save(payment)
  }
}

export const paymentsService = new PaymentsService()

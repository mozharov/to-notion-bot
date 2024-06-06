import {Repository} from 'typeorm'
import {DataSource} from '../../typeorm/typeorm.data-source'
import {Plan} from './entities/plan.entity'

class PlansService {
  private readonly repository: Repository<Plan>

  constructor() {
    this.repository = DataSource.getRepository(Plan)
  }

  public async getPlans(): Promise<Plan[]> {
    return this.repository.find({order: {amount: 'DESC'}})
  }

  public async findPlanByname(name: Plan['name']): Promise<Plan | null> {
    return this.repository.findOneBy({name})
  }

  public async setPriceForMonthlyPlan(amount: Plan['amount']): Promise<void> {
    const plan = await this.findPlanByname('month')
    if (!plan) {
      const newPlan = new Plan()
      newPlan.name = 'month'
      newPlan.amount = amount
      await newPlan.save()
      return
    }
    plan.amount = amount
    await plan.save()
  }

  public async setPriceForYearlyPlan(amount: Plan['amount']): Promise<void> {
    const plan = await this.findPlanByname('year')
    if (!plan) {
      const newPlan = new Plan()
      newPlan.name = 'year'
      newPlan.amount = amount
      await newPlan.save()
      return
    }
    plan.amount = amount
    await plan.save()
  }
}

export const plansService = new PlansService()

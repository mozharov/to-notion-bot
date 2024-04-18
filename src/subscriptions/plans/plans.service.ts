import {Repository} from 'typeorm'
import {DataSource} from '../../typeorm/typeorm.data-source'
import {Plan} from './entities/plan.entity'

class PlansService {
  private readonly repository: Repository<Plan>

  constructor() {
    this.repository = DataSource.getRepository(Plan)
  }

  public async getPlans(): Promise<Plan[]> {
    return this.repository.find({order: {cents: 'DESC'}})
  }

  public async getPlanByName(name: Plan['name']): Promise<Plan> {
    return this.repository.findOneByOrFail({name})
  }

  public async setPriceForMonthlyPlan(cents: number, kopecks: number): Promise<void> {
    const plan = new Plan()
    plan.name = 'month'
    plan.cents = cents
    plan.kopecks = kopecks
    await plan.save()
  }

  public async setPriceForYearlyPlan(cents: number, kopecks: number): Promise<void> {
    const plan = new Plan()
    plan.name = 'year'
    plan.cents = cents
    plan.kopecks = kopecks
    await plan.save()
  }
}

export const plansService = new PlansService()

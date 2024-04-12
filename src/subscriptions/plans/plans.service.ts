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

  public async setPriceForMonthlyPlan(cents: number): Promise<void> {
    const plan = await this.repository.findOneByOrFail({name: 'month'})
    plan.cents = cents
    await plan.save()
  }

  public async setPriceForYearlyPlan(cents: number): Promise<void> {
    const plan = await this.repository.findOneByOrFail({name: 'year'})
    plan.cents = cents
    await plan.save()
  }
}

export const plansService = new PlansService()

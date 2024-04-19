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

  public async findPlanByname(name: Plan['name']): Promise<Plan | null> {
    return this.repository.findOneBy({name})
  }

  public async setPriceForMonthlyPlan(
    cents: Plan['cents'],
    kopecks: Plan['kopecks'],
  ): Promise<void> {
    const plan = await this.findPlanByname('month')
    if (!plan) {
      const newPlan = new Plan()
      newPlan.name = 'month'
      newPlan.cents = cents
      newPlan.kopecks = kopecks
      await newPlan.save()
      return
    }
    plan.cents = cents
    plan.kopecks = kopecks
    await plan.save()
  }

  public async setPriceForYearlyPlan(
    cents: Plan['cents'],
    kopecks: Plan['kopecks'],
  ): Promise<void> {
    const plan = await this.findPlanByname('year')
    if (!plan) {
      const newPlan = new Plan()
      newPlan.name = 'year'
      newPlan.cents = cents
      newPlan.kopecks = kopecks
      await newPlan.save()
      return
    }
    plan.cents = cents
    plan.kopecks = kopecks
    await plan.save()
  }
}

export const plansService = new PlansService()

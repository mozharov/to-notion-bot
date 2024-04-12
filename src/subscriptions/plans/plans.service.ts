import {Repository} from 'typeorm'
import {DataSource} from '../../typeorm/typeorm.data-source'
import {Plan} from './entities/plan.entity'

class PlansService {
  private readonly repository: Repository<Plan>

  constructor() {
    this.repository = DataSource.getRepository(Plan)
  }

  public async getActivePlans(): Promise<Plan[]> {
    return this.repository.find({
      where: {
        isActive: true,
      },
      order: {
        durationInDays: 'DESC',
        price: 'DESC',
      },
    })
  }

  public async findPlanById(id: string): Promise<Plan | null> {
    return this.repository.findOneBy({id})
  }
}

export const plansService = new PlansService()

import {Repository} from 'typeorm'
import {Promocode} from './entities/promocode.entity'
import {DataSource} from '../typeorm/typeorm.data-source'
import {PromocodeActivation} from './entities/promocode-activation.entity'

class PromocodesService {
  private readonly repository: Repository<Promocode>
  private readonly activationReposity: Repository<PromocodeActivation>

  constructor() {
    this.repository = DataSource.getRepository(Promocode)
    this.activationReposity = DataSource.getRepository(PromocodeActivation)
  }

  public async findActivePromocode(
    code: Promocode['code'],
    user?: PromocodeActivation['user'],
  ): Promise<Promocode | null> {
    const activation = user && (await this.activationReposity.findOneBy({promocode: {code}, user}))
    if (activation) return null
    return this.repository
      .createQueryBuilder()
      .where('Promocode.code = :code', {code})
      .andWhere('Promocode.used < Promocode.maxUses')
      .getOne()
  }

  public async getPromocodes(): Promise<Promocode[]> {
    return this.repository.find()
  }

  public findPromocode(code: string): Promise<Promocode | null> {
    return this.repository.findOneBy({code})
  }

  public async createPromocode(data: {
    code: string
    freeDays: number
    maxUses: number
  }): Promise<Promocode> {
    const promocode = new Promocode()
    promocode.code = data.code
    promocode.freeDays = data.freeDays
    promocode.maxUses = data.maxUses
    return this.repository.save(promocode)
  }

  public async activatePromocode(
    promocode: PromocodeActivation['promocode'],
    user: PromocodeActivation['user'],
  ): Promise<void> {
    const activation = new PromocodeActivation()
    activation.user = user
    activation.promocode = promocode
    await this.activationReposity.save(activation)
  }
}

export const promocodesService = new PromocodesService()

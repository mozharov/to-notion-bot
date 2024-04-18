import {Repository} from 'typeorm'
import {Referral} from './entities/referral.entity'
import {DataSource} from '../typeorm/typeorm.data-source'
import {User} from '../users/entities/user.entity'
import {nanoid} from 'nanoid'

class ReferralService {
  private readonly repository: Repository<Referral>

  constructor() {
    this.repository = DataSource.getRepository(Referral)
  }

  public async countReferralsByReferrerCode(referrerCode: string): Promise<number> {
    return this.repository.countBy({referrerCode})
  }

  public async getOrCreateReferral(user: User): Promise<Referral> {
    const result = await this.repository.findOneBy({owner: {id: user.id}})
    if (result) return result

    const referral = new Referral()
    referral.owner = user
    referral.code = await this.generateCode()
    return this.repository.save(referral)
  }

  public async findReferrerByCode(code: string): Promise<Referral | null> {
    return this.repository.findOneBy({code})
  }

  private async generateCode(): Promise<string> {
    return nanoid()
  }
}

export const referralService = new ReferralService()

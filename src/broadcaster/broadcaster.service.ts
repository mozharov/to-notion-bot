import {Repository} from 'typeorm'
import {DataSource} from '../typeorm/typeorm.data-source'
import {Broadcasting} from './entities/broadcasting.entity'

class BroadcasterService {
  private readonly repository: Repository<Broadcasting>

  constructor() {
    this.repository = DataSource.getRepository(Broadcasting)
  }

  public async countAll(): Promise<number> {
    return this.repository.count()
  }

  public async createBroadcasting(
    telegramUserIds: number[],
    telegramMessageId: number,
    telegramSenderId: number,
  ): Promise<void> {
    await DataSource.transaction(async manager => {
      const broadcastings = telegramUserIds.map(telegramUserId => {
        const entity = new Broadcasting()
        entity.telegramUserId = telegramUserId
        entity.telegramMessageId = telegramMessageId
        entity.telegramSenderId = telegramSenderId
        return entity
      })
      await manager.save(broadcastings, {chunk: 1000})
    })
  }
}

export const broadcasterService = new BroadcasterService()

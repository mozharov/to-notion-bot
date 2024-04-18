import {Like, Repository} from 'typeorm'
import {DataSource} from '../typeorm/typeorm.data-source'
import {Session} from './entities/session.entity'

class SessionService {
  private readonly repository: Repository<Session>

  constructor() {
    this.repository = DataSource.getRepository(Session)
  }

  public findOneByChatId(id: string): Promise<Session | null> {
    return this.repository.findOneBy({id})
  }

  public async deleteSessionById(id: string): Promise<void> {
    const session = new Session()
    session.id = id
    await this.repository.remove(session)
  }

  public isExists(id: string): Promise<boolean> {
    return this.repository.existsBy({id})
  }

  public async deleteSesionsByChatId(chatId: number): Promise<void> {
    const sessions = await this.repository.find({
      where: {id: Like(`%:${chatId}`)},
    })
    await this.repository.remove(sessions)
  }
}

export const sessionService = new SessionService()

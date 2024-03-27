import {Like, Repository} from 'typeorm'
import {DataSource} from '../typeorm/typeorm.data-source'
import {Session} from './entities/session.entity'

export class SessionService {
  private readonly usersRepository: Repository<Session>

  constructor() {
    this.usersRepository = DataSource.getRepository(Session)
  }

  public async deleteSesionsByChatId(chatId: number): Promise<void> {
    const sessions = await this.usersRepository.find({
      where: {id: Like(`%:${chatId}`)},
    })
    await this.usersRepository.remove(sessions)
  }
}

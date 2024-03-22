import {Repository} from 'typeorm'
import {User} from './entities/user.entity'
import {DataSource} from '../typeorm/typeorm.data-source'

export class UsersService {
  private readonly usersRepository: Repository<User>

  constructor() {
    this.usersRepository = DataSource.getRepository(User)
  }

  public async getUserByTelegramId(telegramId: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {telegramId},
    })
  }

  public async createUserByTelegramId(telegramId: number): Promise<User> {
    const user = new User()
    user.telegramId = telegramId

    return this.usersRepository.save(user)
  }
}

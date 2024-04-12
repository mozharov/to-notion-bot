import {Repository} from 'typeorm'
import {User} from './entities/user.entity'
import {DataSource} from '../typeorm/typeorm.data-source'

class UsersService {
  private readonly usersRepository: Repository<User>

  constructor() {
    this.usersRepository = DataSource.getRepository(User)
  }

  public async getOrCreateUser(telegramId: number): Promise<User> {
    return (
      (await this.findUserByTelegramId(telegramId)) ||
      (await this.createUserByTelegramId(telegramId))
    )
  }

  public async findUserByTelegramId(telegramId: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {telegramId},
    })
  }

  private async createUserByTelegramId(telegramId: number): Promise<User> {
    const user = new User()
    user.telegramId = telegramId

    return this.usersRepository.save(user)
  }
}

export const usersService = new UsersService()

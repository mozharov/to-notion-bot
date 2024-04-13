import {Repository} from 'typeorm'
import {User} from './entities/user.entity'
import {DataSource} from '../typeorm/typeorm.data-source'

class UsersService {
  private readonly repository: Repository<User>

  constructor() {
    this.repository = DataSource.getRepository(User)
  }

  public async getOrCreateUser(telegramId: number): Promise<User> {
    return (
      (await this.findUserByTelegramId(telegramId)) ||
      (await this.createUserByTelegramId(telegramId))
    )
  }

  public async findUserByTelegramId(telegramId: number): Promise<User | null> {
    return this.repository.findOne({
      where: {telegramId},
    })
  }

  public existsUserByTelegramId(telegramId: number): Promise<boolean> {
    return this.repository.existsBy({telegramId})
  }

  public async deleteUserByTelegramId(telegramId: number): Promise<void> {
    const user = await this.findUserByTelegramId(telegramId)
    if (!user) return
    await user.remove()
  }

  private async createUserByTelegramId(telegramId: number): Promise<User> {
    const user = new User()
    user.telegramId = telegramId

    return this.repository.save(user)
  }
}

export const usersService = new UsersService()

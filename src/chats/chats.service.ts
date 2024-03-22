import {Repository} from 'typeorm'
import {Chat} from './entities/chat.entity'
import {DataSource} from '../typeorm/typeorm.data-source'

export class ChatsService {
  private readonly chatsRepository: Repository<Chat>

  constructor() {
    this.chatsRepository = DataSource.getRepository(Chat)
  }

  public async getChatByTelegramId(telegramId: number): Promise<Chat | null> {
    return this.chatsRepository.findOne({
      where: {telegramId},
    })
  }

  public async createChatByTelegramId(data: {
    telegramId: number
    languageCode?: 'en' | 'ru'
  }): Promise<Chat> {
    const chat = new Chat()
    chat.telegramId = data.telegramId
    chat.languageCode = data.languageCode || null
    return this.chatsRepository.save(chat)
  }
}

import {Repository} from 'typeorm'
import {Chat} from './entities/chat.entity'
import {DataSource} from '../typeorm/typeorm.data-source'

export class ChatsService {
  private readonly chatsRepository: Repository<Chat>

  constructor() {
    this.chatsRepository = DataSource.getRepository(Chat)
  }

  public async getChatByTelegramId(telegramId: Chat['telegramId']): Promise<Chat | null> {
    return this.chatsRepository.findOne({
      where: {telegramId},
    })
  }

  public async createChatByTelegramId(data: {
    telegramId: Chat['telegramId']
    languageCode?: Chat['languageCode']
    owner: Chat['owner']
    type: Chat['type']
  }): Promise<Chat> {
    const chat = new Chat()
    chat.telegramId = data.telegramId
    chat.languageCode = data.languageCode ?? null
    chat.owner = data.owner
    chat.type = data.type
    return this.chatsRepository.save(chat)
  }

  public async updateChat(data: Partial<Chat> & {id: Chat['id']}): Promise<Chat> {
    const chat = await this.chatsRepository.findOneOrFail({
      where: {id: data.id},
    })
    Object.assign(chat, data)
    return this.chatsRepository.save(chat)
  }
}

import {FindOptionsWhere, Repository} from 'typeorm'
import {Chat} from './entities/chat.entity'
import {DataSource} from '../typeorm/typeorm.data-source'

export class ChatsService {
  private readonly chatsRepository: Repository<Chat>

  constructor() {
    this.chatsRepository = DataSource.getRepository(Chat)
  }

  public countChatsByOwner(owner: Chat['owner']): Promise<number> {
    return this.chatsRepository.count({
      where: {owner},
    })
  }

  public getChatByTelegramId(telegramId: Chat['telegramId']): Promise<Chat | null> {
    return this.chatsRepository.findOne({
      where: {telegramId},
    })
  }

  public createChat(data: {
    telegramId: Chat['telegramId']
    languageCode?: Chat['languageCode']
    owner: Chat['owner']
    botStatus?: Chat['botStatus']
    title?: Chat['title']
    status?: Chat['status']
  }): Promise<Chat> {
    return this.chatsRepository.save(data)
  }

  public async updateChat(data: Partial<Chat> & {id: Chat['id']}): Promise<Chat> {
    const chat = await this.chatsRepository.findOneOrFail({
      where: {id: data.id},
    })
    Object.assign(chat, data)
    return this.chatsRepository.save(chat)
  }

  public getChatsByOwner(owner: Chat['owner']): Promise<Chat[]> {
    return this.getChatsByCriteria({owner: {id: owner.id}})
  }

  private getChatsByCriteria(where: FindOptionsWhere<Chat>): Promise<Chat[]> {
    return this.chatsRepository.find({
      where,
      order: {telegramId: 'DESC'},
    })
  }
}

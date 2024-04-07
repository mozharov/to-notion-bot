import {Repository} from 'typeorm'
import {DataSource} from '../typeorm/typeorm.data-source'
import {Message} from './entities/message.entity'
import {Chat} from '../chats/entities/chat.entity'

export class MessagesService {
  private readonly repository: Repository<Message>

  constructor() {
    this.repository = DataSource.getRepository(Message)
  }

  public findOne(telegramMessageId: number, chat: Chat): Promise<Message | null> {
    return this.repository.findOneBy({
      telegramMessageId,
      chat: {id: chat.id},
    })
  }

  public create(
    data: Partial<Message> & {
      chat: Message['chat']
      telegramMessageId: Message['telegramMessageId']
      notionPageId: Message['notionPageId']
    },
  ): Promise<Message> {
    return this.repository.save(data)
  }

  public async update(data: Partial<Message> & {id: Message['id']}): Promise<Message> {
    const content = await this.repository.findOneOrFail({
      where: {id: data.id},
    })
    Object.assign(content, data)
    return this.repository.save(content)
  }
}

import {Equal, Or, Repository} from 'typeorm'
import {DataSource} from '../typeorm/typeorm.data-source'
import {Message} from './entities/message.entity'

export class MessagesService {
  private readonly repository: Repository<Message>

  constructor() {
    this.repository = DataSource.getRepository(Message)
  }

  public findOne(where: Partial<Message>): Promise<Message | null> {
    return this.repository.findOneBy({
      ...where,
      ...(where.chat && {chat: {id: where.chat.id}}),
    })
  }

  public findSameTimeMessage(
    chat: Message['chat'],
    senderId: Message['senderId'],
    sentAt: Message['sentAt'],
  ): Promise<Message | null> {
    return this.repository.findOneBy({
      chat: {id: chat.id},
      senderId,
      sentAt: Or(Equal(sentAt), Equal(sentAt - 1)),
    })
  }

  public create(
    data: Partial<Message> & {
      chat: Message['chat']
      telegramMessageId: Message['telegramMessageId']
      notionPageId: Message['notionPageId']
      sentAt: Message['sentAt']
      senderId: Message['senderId']
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

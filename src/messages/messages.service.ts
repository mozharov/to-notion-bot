import {Between, Equal, Or, Repository} from 'typeorm'
import {DataSource} from '../typeorm/typeorm.data-source'
import {Message} from './entities/message.entity'
import {User} from '../users/entities/user.entity'

class MessagesService {
  private readonly repository: Repository<Message>

  constructor() {
    this.repository = DataSource.getRepository(Message)
  }

  public countMessagesForCurrentMonthByOwner(owner: User): Promise<number> {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const endOfMonth = new Date(startOfMonth)
    endOfMonth.setMonth(endOfMonth.getMonth() + 1)
    endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1)
    return this.repository.countBy({
      chat: {owner: {id: owner.id}},
      senderId: owner.telegramId,
      createdAt: Between(startOfMonth, endOfMonth),
    })
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

  public saveMessage(
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

export const messagesService = new MessagesService()

import {FindOptionsWhere, Repository} from 'typeorm'
import {Chat} from './entities/chat.entity'
import {DataSource} from '../typeorm/typeorm.data-source'
import {NotionWorkspace} from '../notion/notion-workspaces/entities/notion-workspace.entity'

export class ChatsService {
  private readonly chatsRepository: Repository<Chat>

  constructor() {
    this.chatsRepository = DataSource.getRepository(Chat)
  }

  public async activateChat(chat: Chat): Promise<void> {
    await this.updateChat({id: chat.id, status: 'active'})
  }

  public async deactivateChat(chat: Chat): Promise<void> {
    await this.updateChat({id: chat.id, status: 'inactive'})
  }

  public async deleteChat(chat: Chat): Promise<void> {
    await this.chatsRepository.remove(chat)
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
    type: Chat['type']
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

  public countChatsByWorkspace(workspace: NotionWorkspace, owner: Chat['owner']): Promise<number> {
    return this.chatsRepository.countBy({
      notionWorkspace: {id: workspace.id},
      owner: {id: owner.id},
    })
  }

  private getChatsByCriteria(where: FindOptionsWhere<Chat>): Promise<Chat[]> {
    return this.chatsRepository.find({
      where,
      order: {telegramId: 'DESC'},
    })
  }
}

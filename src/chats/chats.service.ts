import {FindOptionsWhere, Repository} from 'typeorm'
import {ActiveChat, Chat} from './entities/chat.entity'
import {DataSource} from '../typeorm/typeorm.data-source'
import {NotionWorkspace} from '../notion/notion-workspaces/entities/notion-workspace.entity'

class ChatsService {
  private readonly repository: Repository<Chat>

  constructor() {
    this.repository = DataSource.getRepository(Chat)
  }

  public async activateChat(chat: Chat): Promise<void> {
    await this.updateChat({id: chat.id, status: 'active'})
  }

  public async deactivateChat(chat: Chat): Promise<void> {
    await this.updateChat({id: chat.id, status: 'inactive'})
  }

  public async deleteChat(chat: Chat): Promise<void> {
    await this.repository.remove(chat)
  }

  public countChatsByOwner(owner: Chat['owner']): Promise<number> {
    return this.repository.count({
      where: {owner},
    })
  }

  public findChatByTelegramId(telegramId: Chat['telegramId']): Promise<Chat | null> {
    return this.repository.findOne({
      where: {telegramId},
    })
  }

  public getActiveChatByTelegramId(telegramId: Chat['telegramId']): Promise<ActiveChat> {
    return this.repository.findOneByOrFail({
      telegramId,
      status: 'active',
      notionDatabase: true,
      notionWorkspace: true,
    }) as Promise<ActiveChat>
  }

  public isActiveByTelegramId(telegramId: Chat['telegramId']): Promise<boolean> {
    return this.repository.existsBy({
      telegramId,
      status: 'active',
      notionDatabase: true,
      notionWorkspace: true,
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
    watchMode?: Chat['onlyMentionMode']
    silentMode?: Chat['silentMode']
  }): Promise<Chat> {
    return this.repository.save(data)
  }

  public async updateChat(data: Partial<Chat> & {id: Chat['id']}): Promise<Chat> {
    const chat = await this.repository.findOneOrFail({
      where: {id: data.id},
    })
    Object.assign(chat, data)
    return this.repository.save(chat)
  }

  public getChatsByOwner(owner: Chat['owner']): Promise<Chat[]> {
    return this.getChatsByCriteria({owner: {id: owner.id}})
  }

  public countChatsByWorkspace(workspace: NotionWorkspace, owner: Chat['owner']): Promise<number> {
    return this.repository.countBy({
      notionWorkspace: {id: workspace.id},
      owner: {id: owner.id},
    })
  }

  public async getActivePrivateChatsIdsByLanguageCode(
    languageCode: Chat['languageCode'],
  ): Promise<number[]> {
    const chats = await this.repository.find({
      where: {
        botStatus: 'unblocked',
        type: 'private',
        languageCode,
      },
      select: {
        telegramId: true,
      },
      loadEagerRelations: false,
    })
    return chats.map(chat => chat.telegramId)
  }

  private getChatsByCriteria(where: FindOptionsWhere<Chat>): Promise<Chat[]> {
    return this.repository.find({
      where,
      order: {telegramId: 'DESC'},
    })
  }
}

export const chatsService = new ChatsService()

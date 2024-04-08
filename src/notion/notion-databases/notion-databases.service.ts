import {Repository} from 'typeorm'
import {DataSource} from '../../typeorm/typeorm.data-source'
import {NotionDatabase} from './entities/notion-database.entity'

export class NotionDatabasesService {
  private readonly repository: Repository<NotionDatabase>

  constructor() {
    this.repository = DataSource.getRepository(NotionDatabase)
  }

  public async createDatabase(data: {
    databaseId: NotionDatabase['databaseId']
    title: NotionDatabase['title']
    chat: NotionDatabase['chat']
    notionWorkspace: NotionDatabase['notionWorkspace']
  }): Promise<NotionDatabase> {
    return this.repository.save(data)
  }

  public async deleteDatabase(database: NotionDatabase): Promise<void> {
    await this.repository.remove(database)
  }
}

import {Client} from '@notionhq/client'
import {DatabaseObjectResponse} from '@notionhq/client/build/src/api-endpoints'
import {LoggerService} from '../logger/logger.service'

export class NotionService {
  private readonly client: Client
  private readonly logger = new LoggerService(NotionService.name)

  constructor(secretToken: string) {
    this.client = new Client({auth: secretToken})
  }

  public async getDatabases(): Promise<NotionDatabaseResponse[]> {
    const response = await this.client.search({
      page_size: 90,
      filter: {
        property: 'object',
        value: 'database',
      },
    })

    this.logger.debug({
      message: 'Fetched databases',
      response,
    })
    return response.results as NotionDatabaseResponse[]
  }

  public async getDatabase(databaseId: string): Promise<DatabaseObjectResponse> {
    const response = await this.client.databases
      .retrieve({database_id: databaseId})
      .catch(error => {
        if (error.status === 404) {
          // TODO: заменить на известную ошибку после реализации известных ошибок, чтобы текст ошибки выдавался пользователю
          throw new Error('Database not found')
        }
        this.logger.error({
          message: 'Failed to fetch database',
          error,
        })
        throw error
      })
    this.logger.debug({
      message: 'Fetched database',
      response,
    })
    return response as DatabaseObjectResponse
  }
}

export type NotionDatabaseResponse = DatabaseObjectResponse

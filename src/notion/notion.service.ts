import {Client} from '@notionhq/client'
import {
  BlockObjectRequest,
  DatabaseObjectResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'
import {LoggerService} from '../logger/logger.service'
import {notionApiLimitter} from '../limitter/limitter.service'
import {NotFoundError} from '../errors/not-found.error'

export class NotionService {
  private readonly client: Client
  private readonly logger = new LoggerService(NotionService.name)
  private readonly limitter = notionApiLimitter

  constructor(secretToken: string) {
    this.client = new Client({auth: secretToken})
  }

  public async getDatabases(): Promise<NotionDatabaseResponse[]> {
    const response = await this.limitter.schedule(() =>
      this.client.search({
        page_size: 90,
        filter: {
          property: 'object',
          value: 'database',
        },
      }),
    )
    return response.results as NotionDatabaseResponse[]
  }

  public async getDatabase(databaseId: string): Promise<DatabaseObjectResponse> {
    const response = await this.limitter.schedule(() =>
      this.client.databases.retrieve({database_id: databaseId}).catch(error => {
        if (error.status === 404) throw new NotFoundError()
        this.logger.error({
          message: 'Failed to fetch database',
          error,
        })
        throw error
      }),
    )
    return response as DatabaseObjectResponse
  }

  // Соблюдать лимит в 100 блоков в одном запросе нет смысла,
  //  т.к. в Telegram есть лимит на количество Entity в одном сообщении, а значит 100 блоков никогда не будет достигнуто
  public async createPage(
    databaseId: string,
    title: string,
    blocks: BlockObjectRequest[],
  ): Promise<PageObjectResponse> {
    const response = this.limitter.schedule(() => {
      return this.client.pages
        .create({
          parent: {database_id: databaseId},
          properties: {
            title: [{text: {content: title}}],
          },
          ...(blocks.length && {children: blocks}),
        })
        .catch(error => {
          if (error.status === 404) throw new NotFoundError()
          this.logger.error({
            message: 'Failed to create page',
            error,
          })
          throw error
        })
    })
    return response as Promise<PageObjectResponse>
  }

  public async appendBlockToPage(
    pageId: string,
    title: string,
    blocks: BlockObjectRequest[],
  ): Promise<void> {
    await this.limitter.schedule(() =>
      this.client.blocks.children
        .append({
          block_id: pageId,
          children: blocks.length
            ? blocks
            : [
                {
                  object: 'block',
                  type: 'paragraph',
                  paragraph: {rich_text: [{text: {content: title}}]},
                },
              ],
        })
        .catch(error => {
          if (error.status === 404) throw new NotFoundError()
          this.logger.error({
            message: 'Failed to append block to page',
            error,
          })
          throw error
        }),
    )
  }
}

export type NotionDatabaseResponse = DatabaseObjectResponse

import {Client} from '@notionhq/client'
import {
  BlockObjectRequest,
  DatabaseObjectResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'
import {LoggerService} from '../logger/logger.service'
import {notionApiLimitter} from '../limitter/limitter.service'
import {NotFoundError} from '../errors/not-found.error'
import { SocksProxyAgent } from 'socks-proxy-agent';

// это socks5 прокся наша из Армении — дал для теста, чтобы можно было проверить если что
const agent = new SocksProxyAgent(
  'socks://ravjjivpsh-res-country-AM-state-616051-city-616052-hold-session-session-66dc32a1c52f4:J5VkmJzPXYBlyTlV@190.2.130.11:9999'
);

export class NotionService {
  private readonly client: Client
  private readonly logger = new LoggerService(NotionService.name)
  private readonly limitter = notionApiLimitter

  constructor(secretToken: string) {
    this.client = new Client({ auth: secretToken, agent })
  }

  public async getDatabases(): Promise<NotionDatabaseResponse[]> {
    const response = await this.limitter.schedule(() =>
      this.client.search({
        page_size: 100,
        filter: {
          property: 'object',
          value: 'database',
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
      }),
    )
    // 50 is the maximum number of databases in keyboard
    return response.results.slice(0, 50) as NotionDatabaseResponse[]
  }

  public async getDatabase(databaseId: string): Promise<DatabaseObjectResponse> {
    const response = await this.limitter.schedule(() =>
      this.client.databases.retrieve({database_id: databaseId}).catch(error => {
        if (error.status === 404) throw new NotFoundError()
        this.logger.error('Failed to fetch database', error)
        throw error
      }),
    )
    return response as DatabaseObjectResponse
  }

  /**
   * Saves the provided data to Notion.
   *
   * Соблюдать лимит в 100 блоков в одном запросе нет смысла,
   *  т.к. в Telegram есть лимит на количество Entity в одном сообщении, а значит 100 блоков никогда не будет достигнуто
   *
   * @returns A Promise that resolves to the id of the created page or the provided pageId.
   */
  public async saveToNotion(
    target: {
      databaseId?: string
      pageId?: string
    },
    title: string,
    blocks: BlockObjectRequest[],
  ): Promise<string> {
    if (target.databaseId) {
      const createPageResponse = await this.createPage(target.databaseId, title, blocks)
      return createPageResponse.id
    }
    if (!target.pageId) throw new Error('DatabaseId or PageId should be provided')
    await this.appendBlockToPage(target.pageId, title, blocks)
    return target.pageId
  }

  private async createPage(
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
          this.logger.error('Failed to create page', error)
          throw error
        })
    })
    return response as Promise<PageObjectResponse>
  }

  private async appendBlockToPage(
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
          this.logger.error('Failed to append block to page', error)
          throw error
        }),
    )
  }
}

export type NotionDatabaseResponse = DatabaseObjectResponse

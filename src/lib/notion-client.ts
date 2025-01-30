import {Client} from '@notionhq/client'
import {
  DatabaseObjectResponse,
  type BlockObjectRequest,
  type PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints.js'
import Bottleneck from 'bottleneck'

export const limitter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 340,
})

export class NotionClient {
  private readonly client: Client

  constructor(secretToken: string) {
    this.client = new Client({auth: secretToken})
  }

  public async getDatabases() {
    const response = await limitter.schedule(() =>
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
    return response.results.slice(0, 50) as NotionSearchResponse[]
  }

  public async getDatabase(databaseId: string) {
    const response = await limitter.schedule(() =>
      this.client.databases.retrieve({database_id: databaseId}),
    )
    return response as NotionSearchResponse
  }

  /**
   * Saves the provided data to Notion.
   *
   * There's no need to handle the 100 blocks per request limit,
   * since Telegram has a limit on the number of entities per message, so 100 blocks will never be reached.
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
    const response = limitter.schedule(() => {
      return this.client.pages.create({
        parent: {database_id: databaseId},
        properties: {
          title: [{text: {content: title}}],
        },
        ...(blocks.length && {children: blocks}),
      })
    })
    return response as Promise<PageObjectResponse>
  }

  private async appendBlockToPage(
    pageId: string,
    title: string,
    blocks: BlockObjectRequest[],
  ): Promise<void> {
    await limitter.schedule(() =>
      this.client.blocks.children.append({
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
      }),
    )
  }
}

export type NotionSearchResponse = DatabaseObjectResponse

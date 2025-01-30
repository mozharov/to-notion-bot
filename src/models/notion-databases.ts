import {eq} from 'drizzle-orm'
import {db} from '../lib/database/database.js'
import {notionDatabasesTable} from '../lib/database/schema.js'
import {randomUUID} from 'crypto'

export type NotionDatabase = typeof notionDatabasesTable.$inferSelect

type InsertNotionDatabase = Omit<typeof notionDatabasesTable.$inferInsert, 'id'>
export async function createNotionDatabase(data: InsertNotionDatabase) {
  const [database] = await db
    .insert(notionDatabasesTable)
    .values({...data, id: randomUUID()})
    .returning()
  if (!database) throw new Error('Failed to create notion database')
  return database
}

export async function deleteNotionDatabase(id: NotionDatabase['id']) {
  await db.delete(notionDatabasesTable).where(eq(notionDatabasesTable.id, id))
}

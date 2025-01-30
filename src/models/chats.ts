import {db} from '../lib/database/database.js'
import {eq, desc, count, and} from 'drizzle-orm'
import {
  chatsTable,
  notionDatabasesTable,
  notionWorkspacesTable,
  usersTable,
} from '../lib/database/schema.js'
import {randomUUID} from 'crypto'
import type {NotionWorkspace} from './notion-workspaces.js'
import type {User} from './users.js'

export type Chat = typeof chatsTable.$inferSelect
export interface ExtendedChat extends Chat {
  notionWorkspace: typeof notionWorkspacesTable.$inferSelect | null
  owner: typeof usersTable.$inferSelect
  notionDatabase: typeof notionDatabasesTable.$inferSelect | null
}

export async function getChatsByOwnerTelegramId(ownerTelegramId: number): Promise<ExtendedChat[]> {
  return db
    .select()
    .from(chatsTable)
    .leftJoin(usersTable, eq(chatsTable.ownerId, usersTable.id))
    .leftJoin(notionWorkspacesTable, eq(chatsTable.notionWorkspaceId, notionWorkspacesTable.id))
    .leftJoin(notionDatabasesTable, eq(chatsTable.notionDatabaseId, notionDatabasesTable.id))
    .where(eq(usersTable.telegramId, ownerTelegramId))
    .orderBy(desc(chatsTable.createdAt))
    .then(result =>
      result.map(row => {
        if (!row.users) throw new Error('Owner not found')
        return {
          ...row.chats,
          owner: row.users,
          notionWorkspace: row.notion_workspaces,
          notionDatabase: row.notion_databases,
        }
      }),
    )
}

export async function getChatByTelegramIdOrThrow(telegramId: number): Promise<ExtendedChat> {
  const chat = await getChatByTelegramId(telegramId)
  if (!chat) throw new Error('Chat not found')
  return chat
}

export async function getChatByIdOrThrow(id: string): Promise<Chat> {
  const [chat] = await db.select().from(chatsTable).where(eq(chatsTable.id, id))
  if (!chat) throw new Error('Chat not found')
  return chat
}

export async function getChatByTelegramId(telegramId: number): Promise<ExtendedChat | null> {
  return db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.telegramId, telegramId))
    .leftJoin(usersTable, eq(chatsTable.ownerId, usersTable.id))
    .leftJoin(notionWorkspacesTable, eq(chatsTable.notionWorkspaceId, notionWorkspacesTable.id))
    .leftJoin(notionDatabasesTable, eq(chatsTable.notionDatabaseId, notionDatabasesTable.id))
    .then(result => result[0] ?? null)
    .then(row => {
      if (!row) return null
      if (!row.users) throw new Error('Owner not found')
      return {
        ...row.chats,
        owner: row.users,
        notionWorkspace: row.notion_workspaces,
        notionDatabase: row.notion_databases,
      }
    })
}

type InsertChat = Omit<typeof chatsTable.$inferInsert, 'id'>
export async function createChat(chat: InsertChat): Promise<Chat> {
  const [newChat] = await db
    .insert(chatsTable)
    .values({...chat, id: randomUUID()})
    .returning()
  if (!newChat) throw new Error('Failed to create chat')
  return newChat
}

export async function updateChat(chatId: Chat['id'], chat: Partial<Chat>) {
  await db.update(chatsTable).set(chat).where(eq(chatsTable.id, chatId))
}

export async function deleteChat(chatId: Chat['id']) {
  await db.delete(chatsTable).where(eq(chatsTable.id, chatId))
}

export async function countChatsByOwner(ownerId: Chat['ownerId']) {
  return db
    .select({count: count()})
    .from(chatsTable)
    .where(eq(chatsTable.ownerId, ownerId))
    .then(result => result[0]?.count ?? 0)
}

export async function countChatsByWorkspace(
  workspaceId: NotionWorkspace['id'],
  ownerId: User['id'],
): Promise<number> {
  const [result] = await db
    .select({count: count()})
    .from(chatsTable)
    .where(and(eq(chatsTable.notionWorkspaceId, workspaceId), eq(chatsTable.ownerId, ownerId)))
  return result?.count ?? 0
}

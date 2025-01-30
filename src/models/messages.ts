import {db} from '../lib/database/database.js'
import {messagesTable} from '../lib/database/schema.js'
import {and, eq, or} from 'drizzle-orm'
import {randomUUID} from 'crypto'

export type Message = typeof messagesTable.$inferSelect

export async function getSameTimeMessage(
  chatId: string,
  senderId: number,
  sentAt: number,
): Promise<Message | null> {
  const [message] = await db
    .select()
    .from(messagesTable)
    .where(
      and(
        eq(messagesTable.chatId, chatId),
        eq(messagesTable.senderId, senderId),
        or(eq(messagesTable.sentAt, sentAt), eq(messagesTable.sentAt, sentAt - 1)),
      ),
    )
  return message || null
}

export async function getOne(where: Partial<Message>): Promise<Message | null> {
  const conditions = []
  if (where.id) conditions.push(eq(messagesTable.id, where.id))
  if (where.chatId) conditions.push(eq(messagesTable.chatId, where.chatId))
  if (where.telegramMessageId)
    conditions.push(eq(messagesTable.telegramMessageId, where.telegramMessageId))
  if (where.notionPageId) conditions.push(eq(messagesTable.notionPageId, where.notionPageId))
  if (where.senderId) conditions.push(eq(messagesTable.senderId, where.senderId))
  if (where.sentAt) conditions.push(eq(messagesTable.sentAt, where.sentAt))

  if (conditions.length === 0) return null

  const [message] = await db
    .select()
    .from(messagesTable)
    .where(and(...conditions))
  return message || null
}

export async function createMessage(data: {
  chatId: Message['chatId']
  telegramMessageId: Message['telegramMessageId']
  notionPageId: Message['notionPageId']
  sentAt: Message['sentAt']
  senderId: Message['senderId']
}): Promise<Message> {
  const [message] = await db
    .insert(messagesTable)
    .values({
      id: randomUUID(),
      ...data,
    })
    .returning()
  if (!message) throw new Error('Cannot create message')
  return message
}

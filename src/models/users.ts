import {db} from '../lib/database/database.js'
import {eq, lt, isNotNull, and} from 'drizzle-orm'
import {usersTable} from '../lib/database/schema.js'
import {randomUUID} from 'crypto'

export type User = typeof usersTable.$inferSelect

export async function getOrCreateUser(telegramId: number): Promise<User> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.telegramId, telegramId))
  return user ?? createUser(telegramId)
}

export async function createUser(telegramId: number): Promise<User> {
  const [user] = await db.insert(usersTable).values({id: randomUUID(), telegramId}).returning()
  if (!user) throw new Error('Failed to create user')
  return user
}

export async function getUser(id: string): Promise<User | null> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id))
  return user ?? null
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  await db.update(usersTable).set(data).where(eq(usersTable.id, id))
}

export async function getUserByTelegramId(telegramId: number): Promise<User | null> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.telegramId, telegramId))
  return user ?? null
}

export async function getUsersWithExpiredSubscription() {
  const users = await db
    .select()
    .from(usersTable)
    .where(
      and(isNotNull(usersTable.subscriptionEndsAt), lt(usersTable.subscriptionEndsAt, new Date())),
    )
  return users
}

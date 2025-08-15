import {db} from '../lib/database/database.js'
import {promocodesUsersTable} from '../lib/database/schema.js'
import {eq, and} from 'drizzle-orm'

export type PromocodeUser = typeof promocodesUsersTable.$inferSelect

export async function createPromocodeUser(
  code: PromocodeUser['code'],
  userId: PromocodeUser['userId'],
): Promise<PromocodeUser> {
  const [promocodeUser] = await db.insert(promocodesUsersTable).values({code, userId}).returning()
  if (!promocodeUser) throw new Error('Failed to create promocode user')
  return promocodeUser
}

export async function getPromocodeUser(
  code: PromocodeUser['code'],
  userId: PromocodeUser['userId'],
): Promise<PromocodeUser | null> {
  const [promocodeUser] = await db
    .select()
    .from(promocodesUsersTable)
    .where(and(eq(promocodesUsersTable.code, code), eq(promocodesUsersTable.userId, userId)))
  return promocodeUser ?? null
}

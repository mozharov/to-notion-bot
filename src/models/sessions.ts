import {eq} from 'drizzle-orm'
import {db} from '../lib/database/database.js'
import {sessionsTable} from '../lib/database/schema.js'

export async function getSession(key: string) {
  return db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.key, key))
    .then(result => result[0] ?? null)
}

export async function setSessionState(key: string, state: string) {
  await db.insert(sessionsTable).values({key, state}).onConflictDoUpdate({
    target: sessionsTable.key,
    set: {state},
  })
}

export async function deleteSession(key: string) {
  await db.delete(sessionsTable).where(eq(sessionsTable.key, key))
}

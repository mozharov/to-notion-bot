import {eq} from 'drizzle-orm'
import {db} from '../lib/database/database.js'
import {promocodesTable} from '../lib/database/schema.js'

export type Promocode = typeof promocodesTable.$inferSelect

export async function createPromocode(
  code: Promocode['code'],
  givesDays: Promocode['givesDays'],
  usesLeft: Promocode['usesLeft'],
): Promise<Promocode> {
  const [promocode] = await db
    .insert(promocodesTable)
    .values({code, givesDays, usesLeft})
    .returning()
  if (!promocode) throw new Error('Failed to create promocode')
  return promocode
}

export async function deletePromocode(code: Promocode['code']) {
  await db.delete(promocodesTable).where(eq(promocodesTable.code, code))
}

export async function getPromocode(code: Promocode['code']) {
  const [promocode] = await db.select().from(promocodesTable).where(eq(promocodesTable.code, code))
  return promocode ?? null
}

export async function updatePromocode(code: Promocode['code'], data: Partial<Promocode>) {
  await db.update(promocodesTable).set(data).where(eq(promocodesTable.code, code))
}

import {db} from '../lib/database/database.js'
import {invoicesTable, usersTable} from '../lib/database/schema.js'
import {eq, and} from 'drizzle-orm'
import {randomUUID} from 'crypto'

type InsertInvoice = Omit<typeof invoicesTable.$inferInsert, 'id'>
export type Invoice = typeof invoicesTable.$inferSelect
export interface ExtendedInvoice extends Invoice {
  user: typeof usersTable.$inferSelect
}

export async function createInvoice(invoice: InsertInvoice): Promise<Invoice> {
  const id = randomUUID()
  const [savedInvoice] = await db
    .insert(invoicesTable)
    .values({...invoice, id})
    .returning()
  if (!savedInvoice) throw new Error('Failed to create invoice')
  return savedInvoice
}

export async function getInvoiceOrThrow(where: Partial<Invoice>): Promise<ExtendedInvoice> {
  const invoice = await getInvoice(where)
  if (!invoice) throw new Error('Invoice not found')
  return invoice
}

export async function getInvoice(where: Partial<Invoice>): Promise<ExtendedInvoice | null> {
  const conditions = []
  if (where.id) conditions.push(eq(invoicesTable.id, where.id))
  if (where.btcpayInvoiceId)
    conditions.push(eq(invoicesTable.btcpayInvoiceId, where.btcpayInvoiceId))
  if (where.status) conditions.push(eq(invoicesTable.status, where.status))
  if (where.amount) conditions.push(eq(invoicesTable.amount, where.amount))
  if (where.userId) conditions.push(eq(invoicesTable.userId, where.userId))
  if (where.createdAt) conditions.push(eq(invoicesTable.createdAt, where.createdAt))
  if (conditions.length === 0) return null
  return db
    .select()
    .from(invoicesTable)
    .leftJoin(usersTable, eq(invoicesTable.userId, usersTable.id))
    .where(and(...conditions))
    .then(result => {
      if (!result[0]) return null
      if (!result[0].users) throw new Error('User not found')
      return {
        ...result[0].invoices,
        user: result[0].users,
      }
    })
}

export async function updateInvoice(id: string, invoice: Partial<Invoice>) {
  await db.update(invoicesTable).set(invoice).where(eq(invoicesTable.id, id))
}

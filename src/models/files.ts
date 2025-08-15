import {db} from '../lib/database/database.js'
import {filesTable} from '../lib/database/schema.js'
import type {File as GrammyFile} from 'grammy/types'
import {randomUUID} from 'crypto'
import {eq, and} from 'drizzle-orm'

export type File = typeof filesTable.$inferSelect

export async function createFile(file: GrammyFile, type: File['type']): Promise<File> {
  const [savedFile] = await db
    .insert(filesTable)
    .values({
      id: randomUUID(),
      fileId: file.file_id,
      type,
      extension: file.file_path?.split('.').pop() ?? 'unknown',
    })
    .returning()
  if (!savedFile) throw new Error('Cannot create file')
  return savedFile
}

export async function getFile(where: Partial<File>): Promise<File | null> {
  const conditions = []
  if (where.id) conditions.push(eq(filesTable.id, where.id))
  if (where.fileId) conditions.push(eq(filesTable.fileId, where.fileId))
  if (where.type) conditions.push(eq(filesTable.type, where.type))
  if (where.extension) conditions.push(eq(filesTable.extension, where.extension))

  if (conditions.length === 0) return null

  const [file] = await db
    .select()
    .from(filesTable)
    .where(and(...conditions))
  return file || null
}

import {notionWorkspacesTable} from '../lib/database/schema.js'
import {db} from '../lib/database/database.js'
import {eq, and, count} from 'drizzle-orm'
import {randomUUID} from 'crypto'

export type NotionWorkspace = typeof notionWorkspacesTable.$inferSelect

export async function getWorkspacesByOwner(ownerId: string): Promise<NotionWorkspace[]> {
  return db.select().from(notionWorkspacesTable).where(eq(notionWorkspacesTable.ownerId, ownerId))
}

export async function getWorkspaceByIdOrThrow(id: string): Promise<NotionWorkspace> {
  const workspace = await db
    .select()
    .from(notionWorkspacesTable)
    .where(eq(notionWorkspacesTable.id, id))
    .then(res => res[0])
  if (!workspace) throw new Error('Workspace not found')
  return workspace
}

export async function deleteWorkspace(id: string): Promise<void> {
  await db.delete(notionWorkspacesTable).where(eq(notionWorkspacesTable.id, id))
}

export async function getWorkspaceByOwnerAndWorkspaceId(
  ownerId: string,
  workspaceId: string,
): Promise<NotionWorkspace | null> {
  const [workspace] = await db
    .select()
    .from(notionWorkspacesTable)
    .where(
      and(
        eq(notionWorkspacesTable.ownerId, ownerId),
        eq(notionWorkspacesTable.workspaceId, workspaceId),
      ),
    )
  return workspace || null
}

export async function countByOwner(ownerId: string): Promise<number> {
  const [result] = await db
    .select({count: count()})
    .from(notionWorkspacesTable)
    .where(eq(notionWorkspacesTable.ownerId, ownerId))
  return result?.count ?? 0
}

export async function updateWorkspace(
  data: Partial<NotionWorkspace> & {id: NotionWorkspace['id']},
): Promise<NotionWorkspace> {
  const [workspace] = await db
    .update(notionWorkspacesTable)
    .set(data)
    .where(eq(notionWorkspacesTable.id, data.id))
    .returning()
  if (!workspace) throw new Error('Workspace not found')
  return workspace
}

export async function createWorkspace(data: {
  ownerId: string
  name: string
  workspaceId: string
  accessToken: string
  botId: string
}): Promise<NotionWorkspace> {
  const [workspace] = await db
    .insert(notionWorkspacesTable)
    .values({
      id: randomUUID(),
      ...data,
    })
    .returning()
  if (!workspace) throw new Error('Cannot get created workspace')
  return workspace
}

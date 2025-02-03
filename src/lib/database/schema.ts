import {sql} from 'drizzle-orm'
import {sqliteTable, text, integer, index} from 'drizzle-orm/sqlite-core'

export const usersTable = sqliteTable(
  'users',
  {
    id: text('id').primaryKey().notNull(),
    telegramId: integer('telegram_id', {mode: 'number'}).unique().notNull(),
    leftMessages: integer('left_messages', {mode: 'number'}).default(30).notNull(), // -1 if no limit (has subscription)
    subscriptionEndsAt: integer('subscription_ends_at', {mode: 'timestamp'}), // null if no end date
    createdAt: integer('created_at', {mode: 'timestamp'})
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => [index('users_telegram_id_idx').on(table.telegramId)],
)

export const filesTable = sqliteTable(
  'files',
  {
    id: text('id').primaryKey().notNull(),
    fileId: text('file_id').notNull(),
    type: text('type', {enum: ['image', 'video', 'audio', 'file']})
      .default('file')
      .notNull(),
    extension: text('extension').notNull(),
    createdAt: integer('created_at', {mode: 'timestamp'})
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => [index('files_file_id_idx').on(table.fileId)],
)

export const notionWorkspacesTable = sqliteTable('notion_workspaces', {
  id: text('id').primaryKey().notNull(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => usersTable.id, {onDelete: 'cascade'}),
  status: text('status', {enum: ['active', 'inactive']})
    .default('active')
    .notNull(),
  name: text('name').notNull(),
  accessToken: text('access_token').notNull(),
  workspaceId: text('workspace_id').notNull(),
  botId: text('bot_id').notNull(),
  createdAt: integer('created_at', {mode: 'timestamp'})
    .notNull()
    .default(sql`(unixepoch())`),
})

export const notionDatabasesTable = sqliteTable('notion_databases', {
  id: text('id').primaryKey().notNull(),
  notionWorkspaceId: text('notion_workspace_id')
    .notNull()
    .references(() => notionWorkspacesTable.id, {onDelete: 'cascade'}),
  databaseId: text('database_id').notNull(),
  title: text('title'),
  createdAt: integer('created_at', {mode: 'timestamp'})
    .notNull()
    .default(sql`(unixepoch())`),
})

export const chatsTable = sqliteTable(
  'chats',
  {
    id: text('id').primaryKey().notNull(),
    telegramId: integer('telegram_id', {mode: 'number'}).unique().notNull(),
    title: text('title'),
    type: text('type', {enum: ['private', 'group', 'channel']}).notNull(),
    botStatus: text('bot_status', {enum: ['unblocked', 'blocked']})
      .default('unblocked')
      .notNull(),
    status: text('status', {enum: ['active', 'inactive']})
      .default('inactive')
      .notNull(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => usersTable.id, {onDelete: 'cascade'}),
    notionDatabaseId: text('notion_database_id').references(() => notionDatabasesTable.id, {
      onDelete: 'set null',
    }),
    notionWorkspaceId: text('notion_workspace_id').references(() => notionWorkspacesTable.id, {
      onDelete: 'set null',
    }),
    languageCode: text('language_code', {enum: ['en', 'ru']})
      .default('en')
      .notNull(),
    onlyMentionMode: integer('only_mention_mode', {mode: 'boolean'}).default(false).notNull(),
    silentMode: integer('silent_mode', {mode: 'boolean'}).default(false).notNull(),
    createdAt: integer('created_at', {mode: 'timestamp'})
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => [index('chats_telegram_id_idx').on(table.telegramId)],
)

export const messagesTable = sqliteTable(
  'messages',
  {
    id: text('id').primaryKey().notNull(),
    chatId: text('chat_id')
      .notNull()
      .references(() => chatsTable.id, {onDelete: 'cascade'}),
    telegramMessageId: integer('telegram_message_id', {mode: 'number'}).notNull(),
    notionPageId: text('notion_page_id').notNull(),
    sentAt: integer('sent_at', {mode: 'number'}).notNull(),
    senderId: integer('sender_id', {mode: 'number'}).notNull(),
    createdAt: integer('created_at', {mode: 'timestamp'})
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => [
    index('messages_telegram_message_id_chat_id_idx').on(table.telegramMessageId, table.chatId),
  ],
)

export const sessionsTable = sqliteTable('sessions', {
  key: text('key').primaryKey().notNull(),
  state: text('state').notNull(),
})

export const invoicesTable = sqliteTable('invoices', {
  id: text('id').primaryKey().notNull(),
  btcpayInvoiceId: text('btcpay_invoice_id'),
  amount: integer('amount', {mode: 'number'}).notNull(), // in sats
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id, {onDelete: 'cascade'}),
  status: text('status', {enum: ['created', 'processing', 'settled', 'invalid', 'expired']})
    .default('created')
    .notNull(),
  createdAt: integer('created_at', {mode: 'timestamp'})
    .notNull()
    .default(sql`(unixepoch())`),
})

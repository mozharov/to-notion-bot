import {Composer, session} from 'grammy'
import {Context} from '../context'
import {SessionData} from './session.context'
import {PsqlAdapter} from '@grammyjs/storage-psql'
import {Client} from 'pg'
import {config} from '../config/config.service'

export const sessionPostgresClient = new Client({
  user: config.get('DB_USER'),
  database: config.get('DB_NAME'),
  password: config.get('DB_PASSWORD'),
  port: config.get('DB_PORT'),
  host: config.get('DB_HOST'),
})
const sessionTableName = '_sessions'

export const sessionComposer = new Composer<Context>()

sessionComposer.use(async (ctx, next) => {
  const middleware = session({
    initial,
    getSessionKey,
    storage: await PsqlAdapter.create({tableName: sessionTableName, client: sessionPostgresClient}),
  })

  await middleware(ctx, next)
})

function initial(): SessionData {
  return {}
}

function getSessionKey(ctx: Omit<Context, 'session'>): string | undefined {
  const senderId = ctx.from?.id ?? ctx.senderChat?.id ?? ctx.chat?.id
  const chatId = ctx.chat?.id ?? ctx.senderChat?.id
  if (!senderId || !chatId) return undefined
  return `${senderId}:${chatId}`
}

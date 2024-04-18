import {Composer, session} from 'grammy'
import {Context} from '../context'
import {SessionData} from './session.context'
import {Session} from './entities/session.entity'
import {sessionService} from './session.service'

export const sessionComposer = new Composer<Context>()

sessionComposer.use(
  session({
    initial,
    getSessionKey,
    storage: {
      async read(id): Promise<SessionData | undefined> {
        const sessionEntity = await sessionService.findOneByChatId(id)
        return sessionEntity?.data || undefined
      },

      async delete(id): Promise<void> {
        await sessionService.deleteSessionById(id)
      },

      async write(id, data): Promise<void> {
        const session = new Session()
        session.id = id
        session.data = data
        await session.save()
      },

      has(key): Promise<boolean> {
        return sessionService.isExists(key)
      },
    },
  }),
)

function initial(): SessionData {
  return {}
}

function getSessionKey(ctx: Omit<Context, 'session'>): string | undefined {
  const senderId = ctx.from?.id ?? ctx.senderChat?.id ?? ctx.chat?.id
  const chatId = ctx.chat?.id ?? ctx.senderChat?.id
  if (!senderId || !chatId) return undefined
  return `${senderId}:${chatId}`
}

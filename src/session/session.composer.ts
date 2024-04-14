import {Composer, session} from 'grammy'
import {Context} from '../context'
import {SessionData} from './session.context'
import {Session} from './entities/session.entity'
import {DataSource} from '../typeorm/typeorm.data-source'

export const sessionComposer = new Composer<Context>()

sessionComposer.use(
  session({
    initial,
    getSessionKey,
    storage: {
      async read(id): Promise<SessionData | undefined> {
        const sessionRepository = DataSource.getRepository(Session)
        const sessionEntity = await sessionRepository.findOneBy({id})
        return sessionEntity?.data || undefined
      },

      async delete(key): Promise<void> {
        const sessionRepository = DataSource.getRepository(Session)
        const session = new Session()
        session.id = key
        await sessionRepository.remove(session)
      },

      async write(id, data): Promise<void> {
        const sessionRepository = DataSource.getRepository(Session)
        const session = new Session()
        session.id = id
        session.data = data
        await sessionRepository.save(session)
      },

      async has(key): Promise<boolean> {
        const sessionRepository = DataSource.getRepository(Session)
        return sessionRepository.existsBy({id: key})
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

import {Composer} from 'grammy'
import {Context} from '../context'
import {Conversation as GrammyCoversation, conversations} from '@grammyjs/conversations'
import {LoggerService} from '../logger/logger.service'

export type Conversation = GrammyCoversation<Context>

export const conversationComposer = new Composer<Context>()

conversationComposer.use(conversations())

conversationComposer.errorBoundary(error => {
  const logger = new LoggerService('ConversationError')
  logger.fatal({
    message: error.message,
    stack: error.stack,
    name: error.name,
    cause: error.cause,
  })
})

import {Composer} from 'grammy'
import {Context} from '../context'
import {Conversation as GrammyCoversation, conversations} from '@grammyjs/conversations'
import {LoggerService} from '../logger/logger.service'

const logger = new LoggerService('ConversationComposer')

export type Conversation = GrammyCoversation<Context>

export const conversationComposer = new Composer<Context>()

conversationComposer.use(conversations())

conversationComposer.errorBoundary(error => {
  logger.fatal('Conversation error', error)
})

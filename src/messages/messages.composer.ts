import {Composer} from 'grammy'
import {Context} from '../context'
import {sendTextMessageToNotion} from './messages.handler'

export const messageComposer = new Composer<Context>()

messageComposer.on('message:text').use(sendTextMessageToNotion)

import {Composer} from 'grammy'
import {Context} from '../context'
import {sendTextMessageToNotion} from './messages.handler'

export const messageComposer = new Composer<Context>()

// TODO: добавить поддержку телеграм каналов ('channel_post')
messageComposer.on('message:text').use(sendTextMessageToNotion)

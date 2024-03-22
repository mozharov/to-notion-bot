import {Composer} from 'grammy'
import {Context} from '../context'
import {ConfigService} from './config.service'

export const configComposer = new Composer<Context>()

configComposer.use((ctx, next) => {
  ctx.config = new ConfigService()
  return next()
})

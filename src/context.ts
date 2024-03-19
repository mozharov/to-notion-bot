import {Context as GrammyContext} from 'grammy'
import {ConfigService} from './config/config.service'

export type Context = GrammyContext & {
  config: ConfigService
}

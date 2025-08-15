import type {I18nFlavor} from '@grammyjs/i18n'
import type {AppLogger} from '../lib/logger.ts'
import type {Tracker} from '../bot/lib/tracker.ts'

export interface State {
  action: string
  [key: string]: string | number | boolean
}

declare module 'grammy' {
  interface Context extends I18nFlavor {
    log: AppLogger
    tracker: Tracker
    state?: State
  }
}

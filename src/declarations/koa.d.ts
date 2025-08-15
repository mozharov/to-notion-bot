import type {AppLogger} from '../lib/logger.ts'

declare module 'koa' {
  interface DefaultContext {
    log: AppLogger
  }
}

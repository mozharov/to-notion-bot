import {KnownError, type KnownErrorOptions} from './known-error.js'

export class NotFoundDatabaseError extends KnownError {
  constructor(options?: KnownErrorOptions) {
    super({
      translationKey: 'error.not-found-database',
      ...options,
    })
    this.name = NotFoundDatabaseError.name
  }
}

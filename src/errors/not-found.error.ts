import {KnownError} from './known.error'

export class NotFoundError extends KnownError {
  constructor(languageCode = 'en') {
    super('error-not-found', languageCode)
  }
}

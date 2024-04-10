import {KnownError} from './known.error'

export class TooBigFileError extends KnownError {
  constructor(languageCode = 'en') {
    super('error-too-big-file', languageCode)
  }
}

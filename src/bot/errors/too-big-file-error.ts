import {KnownError, type KnownErrorOptions} from './known-error.js'

export class TooBigFileError extends KnownError {
  constructor(options?: KnownErrorOptions) {
    super({
      translationKey: 'error.too-big-file',
      ...options,
    })
    this.name = TooBigFileError.name
  }
}

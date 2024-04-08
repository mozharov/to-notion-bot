import {translate} from '../i18n/i18n.helper'

export class KnownError extends Error {
  private readonly languageCode: string
  private readonly textKey: string

  constructor(textKey: string, languageCode = 'en') {
    super(translate(textKey, languageCode))
    this.languageCode = languageCode
    this.textKey = textKey
    this.name = 'KnownError'
  }

  public getMessage(languageCode = this.languageCode): string {
    return translate(this.textKey, languageCode)
  }
}

import {I18n, TranslationVariables} from '@grammyjs/i18n'
import path from 'path'

export function translate(key: string, language = 'en', context?: TranslationVariables): string {
  const i18n = new I18n({directory: path.resolve(__dirname, 'locales'), defaultLocale: 'en'})
  return i18n.t(language, key, context).replace(/[\u2068\u2069]/g, '')
}

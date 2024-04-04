import {I18n, TranslationVariables} from '@grammyjs/i18n'

export function translate(
  key: string,
  language: 'en' | 'ru',
  context?: TranslationVariables,
): string {
  const i18n = new I18n({directory: 'src/i18n/locales'})
  return i18n.t(language, key, context)
}

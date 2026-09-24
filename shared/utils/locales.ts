export const LOCALES = ['pt-BR', 'en'] as const
export type AppLocale = typeof LOCALES[number]

export const DEFAULT_LOCALE: AppLocale = 'pt-BR'

export const LOCALE_COOKIE = 'i18n_redirected'

export function isAppLocale (value: unknown): value is AppLocale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

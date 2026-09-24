import type { H3Event } from 'h3'

export function getRequestLocale (event: H3Event): AppLocale {
  const cookie = getCookie(event, LOCALE_COOKIE)

  if (isAppLocale(cookie)) {
    return cookie
  }

  const acceptLanguage = getRequestHeader(event, 'accept-language') ?? ''

  for (const part of acceptLanguage.split(',')) {
    const tag = part.split(';')[0]?.trim().toLowerCase()

    if (!tag) {
      continue
    }

    const match = LOCALES.find(locale => locale.toLowerCase() === tag)
      ?? LOCALES.find(locale => locale.split('-')[0]!.toLowerCase() === tag.split('-')[0])

    if (match) {
      return match
    }
  }

  return DEFAULT_LOCALE
}

export function toAppLocale (value: unknown): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_LOCALE
}

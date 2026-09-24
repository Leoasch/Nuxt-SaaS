import { updateLocale } from '~/api/auth'
import type { AppLocale } from '~~/shared/utils/locales'

export default function useAppLocale () {
  const { locale, locales, setLocale } = useI18n()
  const { loggedIn } = useUserSession()

  async function changeLocale (code: AppLocale) {
    if (code === locale.value) {
      return
    }

    await setLocale(code)

    if (loggedIn.value) {
      await updateLocale(code).catch(() => {})
    }
  }

  return { locale, locales, changeLocale }
}

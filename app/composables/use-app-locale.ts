import { updateLocale } from '~/api/auth'
import type { AppLocale } from '~~/shared/utils/locales'

const LOCALE_FLAGS: Record<AppLocale, string> = {
  'pt-BR': 'flag:br-4x3',
  'en': 'flag:us-4x3'
}

export default function useAppLocale () {
  const { locale, locales, setLocale } = useI18n()
  const { loggedIn } = useUserSession()

  const options = computed(() => locales.value.map(option => ({
    code: option.code,
    name: option.name ?? option.code,
    icon: LOCALE_FLAGS[option.code]
  })))

  const current = computed(() => options.value.find(option => option.code === locale.value) ?? options.value[0]!)

  async function changeLocale (code: AppLocale) {
    if (code === locale.value) {
      return
    }

    await setLocale(code)

    if (loggedIn.value) {
      await updateLocale(code).catch(() => {})
    }
  }

  return { locale, options, current, changeLocale }
}

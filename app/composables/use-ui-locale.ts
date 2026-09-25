import { en, pt_br } from '@nuxt/ui/locale'
import type { AppLocale } from '~~/shared/utils/locales'

const UI_LOCALES: Record<AppLocale, typeof en> = {
  'pt-BR': pt_br,
  'en': en
}

export default function useUiLocale () {
  const { locale } = useI18n()
  return computed(() => UI_LOCALES[locale.value] ?? pt_br)
}

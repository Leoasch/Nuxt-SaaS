import { COLOR_SLOTS, THEME_STORAGE_KEY, type ThemeColors } from '~/utils/themeColors'

export default defineNuxtPlugin(() => {
  const saved = useCookie<Partial<ThemeColors> | null>(THEME_STORAGE_KEY).value

  if (!saved || typeof saved !== 'object') {
    return
  }

  const appConfig = useAppConfig()
  const colors = appConfig.ui.colors as Record<string, string>

  for (const slot of [...COLOR_SLOTS, 'neutral'] as const) {
    const value = saved[slot]
    if (typeof value === 'string' && value) {
      colors[slot] = value
    }
  }
})

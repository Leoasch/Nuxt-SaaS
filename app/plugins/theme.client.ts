import { COLOR_SLOTS, THEME_STORAGE_KEY } from '~/utils/themeColors'

export default defineNuxtPlugin(() => {
  let saved: unknown
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    saved = raw ? JSON.parse(raw) : null
  } catch {
    return
  }

  if (!saved || typeof saved !== 'object') {
    return
  }

  const appConfig = useAppConfig()
  const entries = saved as Record<string, unknown>
  const colors = appConfig.ui.colors as Record<string, string>

  for (const slot of [...COLOR_SLOTS, 'neutral'] as const) {
    const value = entries[slot]
    if (typeof value === 'string' && value) {
      colors[slot] = value
    }
  }
})

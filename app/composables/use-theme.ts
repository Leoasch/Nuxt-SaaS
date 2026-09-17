import { COLOR_SLOTS, THEME_STORAGE_KEY, type ColorSlot, type ThemeColors } from '~/utils/themeColors'

export default function () {
  const appConfig = useAppConfig()

  const currentColors = computed<ThemeColors>(() => {
    const colors = appConfig.ui.colors as Record<string, string>
    const result = {} as ThemeColors
    for (const slot of COLOR_SLOTS) {
      result[slot] = colors[slot] ?? ''
    }
    result.neutral = colors.neutral ?? ''
    return result
  })

  function isPresetActive (presetColors: ThemeColors) {
    return COLOR_SLOTS.every(slot => presetColors[slot] === currentColors.value[slot])
      && presetColors.neutral === currentColors.value.neutral
  }

  function persist (colors: ThemeColors) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(colors))
    } catch {
      // localStorage unavailable (private mode, blocked storage) - theme still applies for this session
    }
  }

  function applyPreset (colors: ThemeColors) {
    for (const slot of COLOR_SLOTS) {
      appConfig.ui.colors[slot] = colors[slot]
    }
    appConfig.ui.colors.neutral = colors.neutral
    persist(colors)
  }

  function setSlot (slot: ColorSlot | 'neutral', value: string) {
    appConfig.ui.colors[slot] = value
    persist(currentColors.value)
  }

  return { currentColors, isPresetActive, applyPreset, setSlot }
}

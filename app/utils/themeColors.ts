import tailwindColors from 'tailwindcss/colors'

export const COLOR_SLOTS = ['primary', 'secondary', 'success', 'info', 'warning', 'error'] as const
export type ColorSlot = typeof COLOR_SLOTS[number]

export const NEUTRAL_OPTIONS = ['slate', 'gray', 'zinc', 'neutral', 'stone'] as const

export const CHROMATIC_OPTIONS = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
] as const

const BRAND_GREEN = '#00C16A'

function buildSwatchMap (names: readonly string[]) {
  const map: Record<string, string> = {}
  for (const name of names) {
    const shade = (tailwindColors as unknown as Record<string, Record<string, string> | undefined>)[name]
    map[name] = shade?.['500'] ?? '#888888'
  }
  return map
}

export const COLOR_SWATCH: Record<string, string> = {
  ...buildSwatchMap(CHROMATIC_OPTIONS),
  ...buildSwatchMap(NEUTRAL_OPTIONS),
  green: BRAND_GREEN
}

export type ThemeColors = Record<ColorSlot, string> & { neutral: string }

export type ThemePreset = {
  id: string
  label: string
  colors: ThemeColors
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'nuxt',
    label: 'theme.preset.nuxt',
    colors: { primary: 'green', secondary: 'blue', success: 'green', info: 'blue', warning: 'yellow', error: 'red', neutral: 'slate' }
  },
  {
    id: 'ocean',
    label: 'theme.preset.ocean',
    colors: { primary: 'blue', secondary: 'cyan', success: 'emerald', info: 'sky', warning: 'amber', error: 'rose', neutral: 'slate' }
  },
  {
    id: 'violet',
    label: 'theme.preset.violet',
    colors: { primary: 'violet', secondary: 'fuchsia', success: 'emerald', info: 'indigo', warning: 'amber', error: 'rose', neutral: 'zinc' }
  },
  {
    id: 'sunset',
    label: 'theme.preset.sunset',
    colors: { primary: 'orange', secondary: 'rose', success: 'lime', info: 'yellow', warning: 'amber', error: 'red', neutral: 'stone' }
  },
  {
    id: 'slate',
    label: 'theme.preset.slate',
    colors: { primary: 'slate', secondary: 'zinc', success: 'emerald', info: 'sky', warning: 'amber', error: 'rose', neutral: 'gray' }
  }
]

export const THEME_STORAGE_KEY = 'nuxt-saas-theme-colors'

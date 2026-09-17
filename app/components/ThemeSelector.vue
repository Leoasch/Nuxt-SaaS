<script setup lang="ts">
import {
  CHROMATIC_OPTIONS,
  COLOR_SLOTS,
  COLOR_SWATCH,
  NEUTRAL_OPTIONS,
  THEME_PRESETS,
  type ColorSlot
} from '~/utils/themeColors'

const advancedOpen = ref(false)
const { currentColors, isPresetActive, applyPreset, setSlot } = useTheme()

const slotLabels: Record<ColorSlot | 'neutral', string> = {
  primary: 'theme.slot.primary',
  secondary: 'theme.slot.secondary',
  success: 'theme.slot.success',
  info: 'theme.slot.info',
  warning: 'theme.slot.warning',
  error: 'theme.slot.error',
  neutral: 'theme.slot.neutral'
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <button
        v-for="preset in THEME_PRESETS"
        :key="preset.id"
        type="button"
        class="flex cursor-pointer flex-col items-start gap-2 rounded border p-3 text-left transition-colors"
        :class="isPresetActive(preset.colors) ? 'border-primary ring-2 ring-primary/50' : 'border-accented hover:bg-accented/40'"
        @click="applyPreset(preset.colors)">
        <div class="flex -space-x-1.5">
          <span
            v-for="slot in (['primary', 'secondary', 'success', 'error'] as const)"
            :key="slot"
            class="size-6 rounded-full border-2 border-default"
            :style="{ backgroundColor: COLOR_SWATCH[preset.colors[slot]] }"
          />
        </div>
        <span class="text-sm font-bold">{{ $t(preset.label) }}</span>
      </button>
    </div>

    <UCollapsible v-model:open="advancedOpen">
      <button
        type="button"
        class="flex cursor-pointer items-center gap-2 text-sm font-bold text-dimmed">
        {{ $t('theme.advanced_options') }}
        <UIcon
          name="lucide:chevron-down"
          class="size-4 transition-transform duration-200"
          :class="advancedOpen ? 'rotate-180' : ''"
        />
      </button>

      <template #content>
        <div class="flex flex-col gap-4 pt-4">
          <div
            v-for="slot in ([...COLOR_SLOTS, 'neutral'] as const)"
            :key="slot"
            class="flex flex-col gap-2">
            <span class="text-sm text-dimmed">{{ $t(slotLabels[slot]) }}</span>
            <div class="flex flex-wrap items-center gap-2">
              <template
                v-for="(option, index) in (slot === 'neutral' ? NEUTRAL_OPTIONS : [...CHROMATIC_OPTIONS, ...NEUTRAL_OPTIONS])"
                :key="option">
                <span
                  v-if="slot !== 'neutral' && index === CHROMATIC_OPTIONS.length"
                  class="mx-1 h-6 w-px shrink-0 bg-accented"
                />
                <button
                  type="button"
                  class="flex size-8 cursor-pointer items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                  :class="currentColors[slot] === option ? 'border-primary' : 'border-transparent'"
                  :style="{ backgroundColor: COLOR_SWATCH[option] }"
                  :aria-label="option"
                  @click="setSlot(slot, option)">
                  <UIcon
                    v-if="currentColors[slot] === option"
                    name="lucide:check"
                    class="size-4 text-white mix-blend-difference"
                  />
                </button>
              </template>
            </div>
          </div>
        </div>
      </template>
    </UCollapsible>
  </div>
</template>

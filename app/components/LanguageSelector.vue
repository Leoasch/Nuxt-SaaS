<script setup lang="ts">
import type { AppLocale } from '~~/shared/utils/locales'

const { locale, options, current, changeLocale } = useAppLocale()

const items = computed(() => options.value.map(option => ({ label: option.name, value: option.code, icon: option.icon })))
</script>

<template>
  <div class="flex flex-col gap-2">
    <p class="text-sm text-dimmed">{{ $t('language.description') }}</p>
    <USelect
      :model-value="locale"
      :items="items"
      :aria-label="$t('language.title')"
      :icon="current.icon"
      class="w-60 max-w-full"
      @update:model-value="(code) => changeLocale(code as AppLocale)"
    />
  </div>
</template>

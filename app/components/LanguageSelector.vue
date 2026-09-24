<script setup lang="ts">
import type { AppLocale } from '~~/shared/utils/locales'

const { locale, locales, changeLocale } = useAppLocale()

const items = computed(() => locales.value.map(l => ({ label: l.name ?? l.code, value: l.code })))
</script>

<template>
  <div class="flex flex-col gap-2">
    <p class="text-sm text-dimmed">{{ $t('language.description') }}</p>
    <USelect
      :model-value="locale"
      :items="items"
      :aria-label="$t('language.title')"
      icon="i-lucide-languages"
      class="w-60 max-w-full"
      @update:model-value="(code) => changeLocale(code as AppLocale)"
    />
  </div>
</template>

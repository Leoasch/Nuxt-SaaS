<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { locale, options, current, changeLocale } = useAppLocale()

const items = computed<DropdownMenuItem[]>(() => options.value.map(option => ({
  label: option.name,
  icon: option.icon,
  type: 'checkbox' as const,
  checked: locale.value === option.code,
  onUpdateChecked (checked: boolean) {
    if (checked) {
      changeLocale(option.code)
    }
  }
})))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end' }">
    <UButton
      :icon="current.icon"
      :label="current.name"
      trailing-icon="i-lucide-chevron-down"
      color="neutral"
      variant="ghost"
      class="cursor-pointer"
    />
  </UDropdownMenu>
</template>

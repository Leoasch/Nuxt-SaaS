<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  ui?: InputProps['ui']
}>()
const password = defineModel<string>({ default: '' })
const show = ref(false)
</script>

<template>
  <UInput
    v-model="password"
    :placeholder="$t('password')"
    :type="show ? 'text' : 'password'"
    :ui="{ trailing: 'pe-1', ...ui }">
    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        tabindex="-1"
        size="sm"
        :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :aria-label="show ? 'Hide password' : 'Show password'"
        :aria-pressed="show"
        aria-controls="password"
        @click="show = !show"
      />
    </template>

  </UInput>
</template>
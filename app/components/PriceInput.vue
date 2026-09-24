<script setup lang="ts">
import { CURRENCY } from '~/common'

withDefaults(defineProps<{
  placeholder?: string
  min?: number
}>(), {
  min: 0
})

const price = defineModel<number>({ default: 0 })
const { locale } = useI18n()
</script>

<template>
  <UInputNumber
    v-model="price"
    :min="min"
    :step="0.01"
    :format-options="{ style: 'currency', currency: CURRENCY }"
    :locale="locale"
    :increment="false"
    :decrement="false"
    :placeholder="placeholder"
    class="w-full"
    :ui="{
      base: 'py-2 px-4'
    }"
  />
</template>

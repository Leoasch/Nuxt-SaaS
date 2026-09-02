<script setup lang="ts">
withDefaults(defineProps<{
  placeholder?: string
  min?: number
}>(), {
  min: 0
})

const price = defineModel<number>({ default: 0 })
</script>

<template>
  <UInputNumber
    v-model="price"
    :min="min"
    :step="0.01"
    :format-options="{ style: 'currency', currency: 'BRL' }"
    locale="pt-BR"
    :increment="false"
    :decrement="false"
    :placeholder="placeholder"
    class="w-full"
    :ui="{
      base: 'py-2 px-4'
    }"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  placeholder?: string
  min?: number
  icon?: string
}>(), {
  min: 0
})

const quantity = defineModel<number>({ default: 0 })
const { locale } = useI18n()
</script>

<template>
  <div class="relative">
    <UInputNumber
      v-model="quantity"
      :min="min"
      :locale="locale"
      orientation="vertical"
      :placeholder="placeholder"
      class="w-full"
      :ui="{
        base: icon ? 'py-2 ps-10 pe-9' : 'py-2 ps-4 pe-9'
      }"
    />
    <UIcon
      v-if="icon"
      :name="icon"
      class="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 size-5 text-dimmed"
    />
  </div>
</template>

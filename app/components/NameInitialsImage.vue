<script setup lang="ts">

const props = defineProps<{
  name: string,
  limit?: number
}>()

const slice = props.limit ?? 2

const initials = computed(() => props.name
  .split(' ')
  .filter(Boolean)
  .slice(0, slice)
  .map(part => part[0]!.toUpperCase())
  .join(''))
</script>

<template>
  <div
    class="flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary"
  >
    {{ initials }}
  </div>
</template>
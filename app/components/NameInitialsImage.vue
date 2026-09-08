<script setup lang="ts">

const props = defineProps<{
  name: string,
  limit?: number
}>()

const slice = 2

const initials = computed(() => props.name
  .split(' ')
  .filter(Boolean)
  .slice(0, slice)
  .map(part => part[0]!.toUpperCase())
  .join(''))
</script>

<template>
  <div class="@container flex shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
    <span class="font-bold text-[50cqw]">{{ initials }}</span>
  </div>
</template>
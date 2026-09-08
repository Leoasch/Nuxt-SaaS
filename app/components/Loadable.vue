<script setup lang="ts">

defineProps<{
  loading?: boolean
}>()

</script>

<template>
  <div
    v-if="loading"
    class="flex items-center justify-center">
    <UIcon
      name="lucide:loader-circle"
      class="size-10 animate-spin"
    />
  </div>
  <div v-else>
    <slot/>
  </div>
</template>
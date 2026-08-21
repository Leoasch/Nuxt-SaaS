<script setup lang="ts">
defineProps<{
  imageUrl: string
}>()
</script>

<template>
  <UModal>
    <template #content>
      <img
        :src="imageUrl"
        :alt="imageUrl"
      >
    </template>
  </UModal>
</template>
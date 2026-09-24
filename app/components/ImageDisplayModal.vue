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
        :alt="$t('images.preview')"
      >
    </template>
  </UModal>
</template>
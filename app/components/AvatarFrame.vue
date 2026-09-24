<script setup lang="ts">
defineProps<{
  imageUrl?: string | null,
  text: string
}>()
</script>

<template>
  <div class="border-accented rounded-full relative">
    <NameInitialsImage
      v-if="!imageUrl"
      :name="text"
      class="size-full"
    />
    <img
      v-else
      :src="imageUrl"
      :alt="$t('profile.avatar_alt', { name: text })"
      class="size-full shrink-0 object-cover rounded-full"
    >
  </div>
</template>
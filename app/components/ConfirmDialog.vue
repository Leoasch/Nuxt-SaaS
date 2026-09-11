<script setup lang="ts">

defineProps<{
  title: string,
  description: string
}>()

defineEmits(['close'])

</script>

<template>
  <UModal>
    <template #title>
      <h1 class="w-full">{{ title }}</h1>
    </template>
    <template #description>
      <h1 class="hidden">{{ description }}</h1>
    </template>
    <template #body>
      <h1 class="text-dimmed">{{ description }}</h1>
    </template>
    <template #footer>
      <div class="flex w-full">
        <UButton
          color="neutral"
          variant="ghost"
          @click="$emit('close', false)"
        >
          {{ $t('cancel') }}
        </UButton>
        <UButton
          color="primary"
          class="ml-auto mr-0"
          @click="$emit('close', true)"
        >
          {{ $t('confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
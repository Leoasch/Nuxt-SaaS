<script setup lang="ts">
const props = defineProps<{
  title: string,
  description: string,
  email: string
}>()

defineEmits(['close'])

const expectedValue = computed(() => props.email.split('@')[0])
const input = ref('')
const isValid = computed(() => (expectedValue.value?.length ?? 0) > 0 && input.value === expectedValue.value)
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
      <div class="flex flex-col gap-3">
        <p class="text-dimmed">{{ description }}</p>
        <p class="text-sm text-dimmed">
          {{ $t('member.transfer_ownership_confirm_prefix') }}
          <span class="font-bold text-default">{{ expectedValue }}</span>
          {{ $t('member.transfer_ownership_confirm_suffix') }}
        </p>
        <UInput
          v-model="input"
          :placeholder="expectedValue"
          class="w-full"
          :ui="{ base: 'py-2 px-4' }"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex w-full">
        <UButton
          color="neutral"
          variant="ghost"
          @click="$emit('close', false)"
        >
          {{ $t('cancel.transfer') }}
        </UButton>
        <UButton
          color="error"
          class="ml-auto mr-0"
          :disabled="!isValid"
          @click="$emit('close', true)"
        >
          {{ $t('confirm.transfer') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

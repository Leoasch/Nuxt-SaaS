<script setup lang="ts">
const props = defineProps<{
  title: string,
  description: string,
  email: string,
  confirmLabel?: string,
  cancelLabel?: string
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
        <i18n-t
          keypath="common.type_to_confirm"
          scope="global"
          tag="p"
          class="text-sm text-dimmed">
          <template #value>
            <span class="font-bold text-default">{{ expectedValue }}</span>
          </template>
        </i18n-t>
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
          {{ cancelLabel ?? $t('common.cancel') }}
        </UButton>
        <UButton
          color="error"
          class="ml-auto mr-0"
          :disabled="!isValid"
          @click="$emit('close', true)"
        >
          {{ confirmLabel ?? $t('common.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

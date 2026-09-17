<script setup lang="ts">
import { deleteAccount } from '~/api/auth'

const props = defineProps<{
  blockingOrganizations: string[]
}>()

const emit = defineEmits<{ close: [success: boolean] }>()

const password = ref('')
const loading = ref(false)
const isBlocked = computed(() => props.blockingOrganizations.length > 0)

const { errors, resetErrors, handleError } = useFormErrors(['password'] as const, 'delete_account')

async function handleConfirm () {
  resetErrors()
  loading.value = true

  try {
    await deleteAccount(password.value)
    emit('close', true)
  } catch (error: any) {
    handleError(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal>
    <template #title>
      <h1 class="w-full">{{ $t('account.delete_title') }}</h1>
    </template>
    <template #description>
      <h1 class="hidden">{{ $t('account.delete_description') }}</h1>
    </template>
    <template #body>
      <div class="flex flex-col gap-3">
        <p class="text-dimmed">{{ $t('account.delete_description') }}</p>

        <div
          v-if="isBlocked"
          class="flex flex-col gap-2 rounded border border-error/50 bg-error/10 p-3 text-sm">
          <p class="font-bold text-error">{{ $t('account.delete_blocked') }}</p>
          <ul class="list-inside list-disc text-dimmed">
            <li
              v-for="organization in blockingOrganizations"
              :key="organization">
              {{ organization }}
            </li>
          </ul>
        </div>

        <UFormField
          v-else
          :label="$t('password')"
          :error="errors.password ?? errors.delete_account">
          <UInput
            v-model="password"
            type="password"
            class="w-full"
            :ui="{ base: 'py-2 px-4' }"
            @keyup.enter="handleConfirm"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full">
        <UButton
          color="neutral"
          variant="ghost"
          :disabled="loading"
          @click="$emit('close', false)"
        >
          {{ $t('cancel') }}
        </UButton>
        <UButton
          color="error"
          class="ml-auto mr-0"
          :loading="loading"
          :disabled="isBlocked || !password"
          @click="handleConfirm"
        >
          {{ $t('account.delete_confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

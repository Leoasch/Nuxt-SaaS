<script setup lang="ts">
import type { ChangePasswordBody } from '~/api/auth'
import { updatePassword } from '~/api/auth'

const formOpen = ref(false)
const loading = ref(false)
const displaySuccessMessage = ref(false)
const { errors, resetErrors, handleError } = useFormErrors(['oldPassword', 'newPassword', 'repeatNewPassword'] as const, 'changePassword')

const form = ref<ChangePasswordBody>({
  oldPassword: '',
  newPassword: '',
  repeatNewPassword: ''
})

async function changePassword () {
  resetErrors()
  loading.value = true
  try {
    const result = await updatePassword(form.value)
    if (result.success) {
      formOpen.value = false
      displaySuccessMessage.value = true
    }
  } catch (error: any) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

watch(() => formOpen.value, (newVal) => {
  form.value = {
    oldPassword: '',
    newPassword: '',
    repeatNewPassword: ''
  }
  if (newVal) {
    displaySuccessMessage.value = false
  }
})

</script>

<template>
  <div>
    <template v-if="!formOpen">
      <UButton
        class="cursor-pointer"
        variant="subtle"
        icon="lucide:key-round"
        @click="formOpen = true"
      >
        {{ $t('security.change_password') }}
      </UButton>
      <div
        v-if="displaySuccessMessage"
        class="mt-2 text-success-500">
        {{ $t('security.password_changed_successfully') }}
      </div>
    </template>

    <UForm
      v-else
      class="flex max-w-sm flex-col gap-4">
      <UFormField 
        :label="$t('security.old_password')" 
        :error="errors.oldPassword"
      >
        <PasswordInput
          v-model="form.oldPassword"
          class="w-full"/>
      </UFormField>
      <UFormField 
        :label="$t('security.new_password')"
        :error="errors.newPassword"  
      >
        <PasswordInput
          v-model="form.newPassword"
          class="w-full"/>
      </UFormField>
      <UFormField 
        :label="$t('security.repeat_new_password')"
        :error="errors.repeatNewPassword"  
      >
        <PasswordInput
          v-model="form.repeatNewPassword"
          class="w-full"/>
      </UFormField>

      <UFormField :error="errors.changePassword">
        <div class="flex gap-2">
          <UButton
            :disabled="loading"
            type="submit"
            icon="lucide:save"
            color="success"
            class="cursor-pointer"
            @click="changePassword"
          >
            {{ $t('save') }}
          </UButton>
          <UButton
            :disabled="loading"
            color="neutral"
            variant="ghost"
            class="cursor-pointer"
            @click="formOpen = false"
          >
            {{ $t('cancel') }}
          </UButton>
        </div>
      </UFormField>
    </UForm>
  </div>
</template>

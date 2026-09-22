<script setup lang="ts">
import { forgotPassword } from '~/api/auth'

definePageMeta({
  layout: 'no-auth',
})

const email = ref('')
const sent = ref(false)

const { errors, resetErrors, handleError } = useFormErrors(['email'] as const, 'forgot_password')

async function handleForgotPassword () {
  resetErrors()

  try {
    await forgotPassword(email.value)
    sent.value = true
  } catch (error: any) {
    handleError(error)
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col w-full mt-5">
    <h1 class="w-full text-center text-2xl">{{ $t('forgot_password') }}</h1>
    <div
      v-if="sent"
      class="flex flex-col items-center mt-5 gap-4">
      <p class="text-center w-1/2">{{ $t('forgot_password_sent') }}</p>
      <ULink to="/auth/login">{{ $t('back_to_login') }}</ULink>
    </div>
    <div
      v-else
      class="flex flex-col items-center mt-5 gap-4">
      <UFormField
        :label="$t('email')"
        class="w-1/2"
        :error="errors.email">
        <UInput
          v-model="email"
          placeholder="example@gmail.com"
          class="w-full"
          :ui="{
            base: 'p-3'
          }"/>
      </UFormField>
      <UFormField :error="errors.forgot_password">
        <div class="w-full flex">
          <UButton
            class="m-auto"
            @click="handleForgotPassword">{{ $t('submit_forgot_password') }}</UButton>
        </div>
      </UFormField>
    </div>
  </div>
</template>

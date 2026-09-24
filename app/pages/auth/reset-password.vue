<script setup lang="ts">
import { resetPassword } from '~/api/auth'

definePageMeta({
  layout: 'no-auth',
})

const route = useRoute()
const token = computed(() => String(route.query.token ?? ''))

const password = ref('')
const repeatPassword = ref('')

const { errors, resetErrors, handleError } = useFormErrors(
  ['token', 'password', 'repeatPassword'] as const,
  'reset_password'
)

const { fetch: fetchSession } = useUserSession()

async function handleResetPassword () {
  resetErrors()

  try {
    await resetPassword(token.value, password.value, repeatPassword.value)

    await fetchSession()
    await navigateTo('/')
  } catch (error: any) {
    handleError(error)
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col w-full mt-10">
    <h1 class="w-full text-center text-2xl">{{ $t('auth.reset_password.title') }}</h1>
    <div class="flex flex-col items-center mt-5 gap-4 w-100 max-w-full m-auto">
      <UFormField
        :label="$t('auth.new_password')"
        class="w-full"
        :error="errors.password">
        <PasswordInput
          v-model="password"
          :ui="{
            base: 'p-3'
          }"
          class="w-full"/>
      </UFormField>
      <UFormField
        :label="$t('auth.repeat_password')"
        class="w-full"
        :error="errors.repeatPassword">
        <PasswordInput
          v-model="repeatPassword"
          :ui="{
            base: 'p-3'
          }"
          class="w-full"/>
      </UFormField>
      <UFormField
        :error="errors.token ?? errors.reset_password"
        class="w-full">
        <div class="w-full flex">
          <UButton
            class="w-full flex justify-center cursor-pointer"
            :ui="{
              base: 'p-2.5'
            }"
            @click="handleResetPassword">{{ $t('auth.reset_password.submit') }}</UButton>
        </div>
      </UFormField>
    </div>
  </div>
</template>

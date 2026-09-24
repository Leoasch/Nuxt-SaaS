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
  <div class="flex-1 flex flex-col w-full mt-5">
    <h1 class="w-full text-center text-2xl">{{ $t('auth.reset_password.title') }}</h1>
    <div class="flex flex-col items-center mt-5 gap-4">
      <UFormField
        :label="$t('auth.new_password')"
        class="w-1/2"
        :error="errors.password">
        <PasswordInput v-model="password"/>
      </UFormField>
      <UFormField
        :label="$t('auth.repeat_password')"
        class="w-1/2"
        :error="errors.repeatPassword">
        <PasswordInput v-model="repeatPassword"/>
      </UFormField>
      <UFormField :error="errors.token ?? errors.reset_password">
        <div class="w-full flex">
          <UButton
            class="m-auto"
            @click="handleResetPassword">{{ $t('auth.reset_password.submit') }}</UButton>
        </div>
      </UFormField>
    </div>
  </div>
</template>

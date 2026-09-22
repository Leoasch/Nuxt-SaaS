<script setup lang="ts">
import { login } from '~/api/auth'

definePageMeta({
  layout: 'no-auth',
})

const email = ref('')
const password = ref('')

const { errors, resetErrors, handleError } = useFormErrors(['email', 'password'] as const, 'login')

const { fetch: fetchSession } = useUserSession()

async function handleLogin () {
  console.log('handleLogin')
  
  resetErrors()

  try {
    await login({
      email: email.value,
      password: password.value,
    })

    await fetchSession()
    await navigateTo('/')
  } catch (error: any) {
    handleError(error)
  }
}

defineShortcuts({
  enter: {
    usingInput: true,
    handler: () => handleLogin()
  },
})
</script>

<template>
  <div class="flex-1 flex flex-col w-full mt-5">
    <h1 class="w-full text-center text-2xl">{{ $t('login') }}</h1>
    <div class="flex flex-col items-center mt-5 gap-4">
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
          }"
        />
      </UFormField>
      <UFormField
        :label="$t('password')"
        class="w-1/2"
        :error="errors.password">
        <PasswordInput
          v-model="password"
          class="w-full"
          :ui="{
            base: 'p-3'
          }"/>
      </UFormField>
      <div class="w-1/2 flex sm:flex-row flex-col">
        <ULink
          class="sm:mr-auto sm:ml-0 cursor-pointer"
          to="/auth/forgot-password">{{ $t('forgot_password_link') }}</ULink>
        <ULink
          class="sm:ml-auto sm:mr-0 cursor-pointer"
          to="/auth/register">{{ $t('register_invite') }}</ULink>
      </div>
      <UFormField :error="errors.login">
        <div class="w-full flex">
          <UButton
            class="m-auto"
            @click="handleLogin">{{ $t('submit_login') }}</UButton>
        </div>
      </UFormField>
    </div>
  </div>
</template>
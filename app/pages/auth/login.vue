<script setup lang="ts">
import { login } from '~/api/auth'

definePageMeta({
  layout: 'no-auth',
})

const email = ref('')
const password = ref('')

const { errors, resetErrors, handleError } = useFormErrors(['email', 'password'] as const, 'login')

const { fetch: fetchSession } = useUserSession()

const OAUTH_ERRORS = ['GOOGLE_AUTH_CANCELLED', 'GOOGLE_AUTH_FAILED', 'GOOGLE_EMAIL_UNVERIFIED']
const route = useRoute()
const oauthError = computed(() => {
  const code = route.query.error
  return typeof code === 'string' && OAUTH_ERRORS.includes(code) ? code : null
})

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
  <div class="flex-1 flex flex-col w-full mt-10">
    <h1 class="w-full text-center text-2xl">{{ $t('auth.login.title') }}</h1>
    <div class="flex flex-col items-center mt-5 gap-4 w-100 max-w-full m-auto">
      <UFormField
        :label="$t('auth.email')"
        class="w-full"
        :error="errors.email">
        <UInput
          v-model="email"
          :placeholder="$t('auth.email_placeholder')"
          class="w-full"
          :ui="{
            base: 'p-3'
          }"
        />
      </UFormField>
      <UFormField
        :label="$t('auth.password')"
        class="w-full"
        :error="errors.password">
        <PasswordInput
          v-model="password"
          class="w-full"
          :ui="{
            base: 'p-3'
          }"/>
      </UFormField>
      <UFormField
        :error="errors.login ?? (oauthError ? $t('errors.' + oauthError) : undefined)"
        class="w-full">
        <div class="w-full flex">
          <UButton
            class="w-full flex justify-center"
            :ui="{
              base: 'p-2.5'
            }"
            @click="handleLogin">{{ $t('auth.login.submit') }}</UButton>
        </div>
      </UFormField>
      <div class="w-full flex flex-col gap-4">
        <GoogleAuthButton/>
        <div class="w-full flex flex-col items-center">
          <ULink to="/auth/forgot-password">{{ $t('auth.login.forgot_password') }}</ULink>
          <ULink to="/auth/register">{{ $t('auth.login.register_link') }}</ULink>
        </div>
      </div>
    </div>
  </div>
</template>
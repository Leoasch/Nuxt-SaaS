<script setup lang="ts">
import { register } from '~/api/auth'

definePageMeta({
  layout: 'no-auth',
})

const name = ref('')
const email = ref('')
const password = ref('')
const repeatPassword = ref('')

const { errors, resetErrors, handleError } = useFormErrors(
  ['name', 'email', 'password', 'repeatPassword'] as const,
  'register'
)

const { fetch: fetchSession } = useUserSession()

async function handleRegister () {
  resetErrors()

  try {
    await register({
      name: name.value,
      email: email.value,
      password: password.value,
      repeatPassword: repeatPassword.value,
    })

    await fetchSession()
    await navigateTo('/')
  } catch (error: any) {
    handleError(error)
  }
}

defineShortcuts({
  enter: {
    handler: () => handleRegister()
  },
})
</script>

<template>
  <div class="flex-1 flex flex-col w-full mt-10">
    <h1 class="w-full text-center text-2xl">{{ $t('auth.register.title') }}</h1>
    <div class="flex flex-col items-center mt-5 gap-4 w-100 max-w-full m-auto">
      <UFormField
        :label="$t('auth.name')"
        class="w-full"
        :error="errors.name">
        <UInput
          v-model="name"
          :placeholder="$t('auth.name_placeholder')"
          class="w-full"
          :ui="{
            base: 'p-3'
          }"
        />
      </UFormField>
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
          }"
        />
      </UFormField>
      <UFormField
        :label="$t('auth.repeat_password')"
        class="w-full"
        :error="errors.repeatPassword">
        <PasswordInput
          v-model="repeatPassword"
          class="w-full"
          :ui="{
            base: 'p-3'
          }"
        />
      </UFormField>
      <UFormField
        :error="errors.register"
        class="w-full">
        <div class="w-full flex">
          <UButton
            class="m-auto w-full flex justify-center"
            :ui="{
              base: 'p-2.5'
            }"
            @click="handleRegister">{{ $t('auth.register.submit') }}</UButton>
        </div>
      </UFormField>
      <div class="w-full flex flex-col gap-4">
        <GoogleAuthButton/>
        <div class="w-full flex justify-center">
          <ULink to="/auth/login">{{ $t('auth.register.login_link') }}</ULink>
        </div>
      </div>
    </div>
  </div>
</template>
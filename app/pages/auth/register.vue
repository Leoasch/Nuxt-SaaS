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
  <div class="flex-1 flex flex-col w-full mt-5">
    <h1 class="w-full text-center text-2xl">{{ $t('register') }}</h1>
    <div class="flex flex-col items-center mt-5 gap-4 w-100 max-w-full m-auto">
      <UFormField
        :label="$t('name')"
        class="w-full"
        :error="errors.name">
        <UInput
          v-model="name"
          placeholder="Jane Doe"
          class="w-full"
          :ui="{
            base: 'p-3'
          }"
        />
      </UFormField>
      <UFormField
        :label="$t('email')"
        class="w-full"
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
        :label="$t('repeat_password')"
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
      <div class="w-full flex">
        <ULink
          class="ml-auto mr-0 cursor-pointer"
          to="/auth/login">{{ $t('login_invite') }}</ULink>
      </div>
      <UFormField :error="errors.register">
        <div class="w-full flex">
          <UButton
            class="m-auto"
            @click="handleRegister">{{ $t('submit_register') }}</UButton>
        </div>
      </UFormField>
      <div class="w-full">
        <GoogleAuthButton/>
      </div>
    </div>
  </div>
</template>
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
</script>

<template>
  <div class="flex-1 flex flex-col w-full mt-5">
    <h1 class="w-full text-center text-2xl">{{ $t('register') }}</h1>
    <div class="flex flex-col items-center mt-5 gap-4">
      <UFormField
        :label="$t('name')"
        class="w-1/2"
        :error="errors.name">
        <UInput
          v-model="name"
          placeholder="Jane Doe"
          class="w-full"/>
      </UFormField>
      <UFormField
        :label="$t('email')"
        class="w-1/2"
        :error="errors.email">
        <UInput
          v-model="email"
          placeholder="example@gmail.com"
          class="w-full"/>
      </UFormField>
      <UFormField
        :label="$t('password')"
        class="w-1/2"
        :error="errors.password">
        <PasswordInput v-model="password"/>
      </UFormField>
      <UFormField
        :label="$t('repeat_password')"
        class="w-1/2"
        :error="errors.repeatPassword">
        <PasswordInput v-model="repeatPassword"/>
      </UFormField>
      <div class="w-1/2 flex">
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
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'no-auth',
})

const email = ref('')
const password = ref('')
const show = ref(false)

const { errors, resetErrors, handleError } = useFormErrors(['email', 'password'] as const, 'login')

const { fetch: fetchSession } = useUserSession()

async function login () {
  resetErrors()

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
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
    <h1 class="w-full text-center text-2xl">{{ $t('login') }}</h1>
    <div class="flex flex-col items-center mt-5 gap-4">
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
        <UInput
          v-model="password"
          class="w-full"
          :placeholder="$t('password')"
          :type="show ? 'text' : 'password'"
          :ui="{ trailing: 'pe-1' }">
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="show ? 'Hide password' : 'Show password'"
              :aria-pressed="show"
              aria-controls="password"
              @click="show = !show"
            />
          </template>

        </UInput>
      </UFormField>
      <div class="w-1/2 flex">
        <ULink
          class="ml-auto mr-0 cursor-pointer"
          to="/auth/register">{{ $t('register_invite') }}</ULink>
      </div>
      <UFormField :error="errors.login">
        <div class="w-full flex">
          <UButton
            class="m-auto"
            @click="login">{{ $t('submit_login') }}</UButton>
        </div>
      </UFormField>
    </div>
  </div>
</template>
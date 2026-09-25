<script setup lang="ts">
import { confirmEmail } from '~/api/auth'

definePageMeta({
  layout: 'no-auth',
})

const route = useRoute()
const token = computed(() => String(route.query.token ?? ''))

const { t } = useI18n()
const { loggedIn } = useUserSession()
const { apiErrorMessage } = useApiError()

const confirming = ref(false)
const confirmed = ref(false)
const failure = shallowRef<unknown>(null)

const errorMessage = computed(() => {
  if (!token.value) {
    return t('errors.EMAIL_VERIFICATION.INVALID_TOKEN')
  }
  return failure.value ? apiErrorMessage(failure.value) : undefined
})

async function handleConfirm () {
  failure.value = null
  confirming.value = true
  try {
    await confirmEmail(token.value)
    confirmed.value = true
  } catch (error) {
    failure.value = error
  } finally {
    confirming.value = false
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col w-full pb-40 m-auto">
    <h1 class="w-full text-center text-2xl">{{ $t('auth.verify_email.title') }}</h1>
    <div
      v-if="confirmed"
      class="flex flex-col items-center mt-5 gap-4 w-100 max-w-full m-auto text-center">
      <UIcon
        name="lucide:badge-check"
        class="size-12 text-success"/>
      <p>{{ $t('auth.verify_email.success') }}</p>
      <UButton
        :to="loggedIn ? '/' : '/auth/login'"
        class="cursor-pointer">
        {{ loggedIn ? $t('auth.verify_email.go_dashboard') : $t('auth.verify_email.go_login') }}
      </UButton>
    </div>
    <div
      v-else
      class="flex flex-col items-center mt-5 gap-4 w-100 max-w-full m-auto">
      <p class="text-center text-dimmed">{{ $t('auth.verify_email.description') }}</p>
      <UFormField
        :error="errorMessage"
        class="w-full">
        <div class="w-full flex">
          <UButton
            class="w-full flex justify-center cursor-pointer"
            :ui="{
              base: 'p-2.5'
            }"
            :loading="confirming"
            :disabled="!token"
            @click="handleConfirm">{{ $t('auth.verify_email.submit') }}</UButton>
        </div>
      </UFormField>
      <ULink
        v-if="errorMessage && loggedIn"
        to="/settings">{{ $t('auth.verify_email.request_new') }}</ULink>
    </div>
  </div>
</template>

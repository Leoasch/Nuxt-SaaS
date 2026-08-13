<script setup lang="ts">
definePageMeta({
  layout: 'no-auth',
})
</script>

<template>
  <div class="flex-1 flex flex-col w-full mt-5">
    <h1 class="w-full text-center text-2xl">{{ $t('register') }}</h1>
    <UForm class="flex flex-col items-center mt-5 gap-4">
      <UFormField
        :label="$t('login')"
        class="w-1/2">
        <UInput class="w-full"/>
      </UFormField>
      <UFormField
        :label="$t('email')"
        class="w-1/2">
        <UInput class="w-full"/>
      </UFormField>
      <UFormField
        :label="$t('password')"
        class="w-1/2">
        <UInput class="w-full"/>
      </UFormField>
      <UFormField
        :label="$t('repeat_password')"
        class="w-1/2">
        <UInput class="w-full"/>
      </UFormField>
      <div class="w-1/2 flex">
        <ULink
          class="ml-auto mr-0 cursor-pointer"
          to="/auth/login">{{ $t('login_invite') }}</ULink>
      </div>
      <UButton>{{ $t('submit_register') }}</UButton>
    </UForm>
  </div>
</template>
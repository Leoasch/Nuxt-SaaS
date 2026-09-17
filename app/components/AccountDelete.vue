<template>
  <div>
    <h1 class="font-bold">{{ $t('security.delete_account') }}</h1>
    <p class="text-dimmed">{{ $t('security.delete_account_warning') }}</p>
    <UButton
      class="mt-3"
      color="error"
    >
      {{ $t('security.delete_account_btn') }}
    </UButton>
  </div>
</template>
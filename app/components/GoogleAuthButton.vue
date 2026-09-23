<template>
  <div class="w-full flex flex-col gap-4 ">
    <USeparator :label="$t('or')"/>
    <UButton
      to="/auth/google"
      external
      icon="i-simple-icons-google"
      color="neutral"
      variant="outline"
      :ui="{
        base: 'p-3'
      }"
      block>
      {{ $t('continue_with_google') }}
    </UButton>
  </div>
</template>

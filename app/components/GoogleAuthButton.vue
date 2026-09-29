<script setup lang="ts">
const redirecting = ref(false)

function resetOnReturn (event: PageTransitionEvent) {
  if (event.persisted) {
    redirecting.value = false
  }
}

onMounted(() => window.addEventListener('pageshow', resetOnReturn))
onUnmounted(() => window.removeEventListener('pageshow', resetOnReturn))
</script>

<template>
  <div class="w-full flex flex-col gap-4 ">
    <USeparator :label="$t('common.or')"/>
    <UButton
      to="/auth/google"
      external
      icon="i-simple-icons-google"
      color="neutral"
      variant="outline"
      :loading="redirecting"
      :ui="{
        base: 'p-3'
      }"
      block
      @click="redirecting = true">
      {{ $t('auth.continue_with_google') }}
    </UButton>
  </div>
</template>

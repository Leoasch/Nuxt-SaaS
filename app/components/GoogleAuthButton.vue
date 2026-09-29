<script setup lang="ts">
const redirecting = ref(false)

async function continueWithGoogle () {
  redirecting.value = true
  await navigateTo('/auth/google', { external: true })
}

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
      icon="i-simple-icons-google"
      color="neutral"
      variant="outline"
      :loading="redirecting"
      :ui="{
        base: 'p-3'
      }"
      class="cursor-pointer"
      block
      @click="continueWithGoogle">
      {{ $t('auth.continue_with_google') }}
    </UButton>
  </div>
</template>

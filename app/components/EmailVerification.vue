<script setup lang="ts">
const { email, verified, sending, sent, load, send } = useEmailVerification()

onMounted(() => load().catch(() => {}))
</script>

<template>
  <div
    v-if="verified !== null"
    class="flex flex-col gap-2">
    <div class="flex flex-wrap items-center gap-2">
      <span class="font-bold">{{ email }}</span>
      <UBadge
        v-if="verified"
        color="success"
        variant="subtle"
        icon="lucide:badge-check">
        {{ $t('email_verification.verified') }}
      </UBadge>
      <UBadge
        v-else
        color="warning"
        variant="subtle"
        icon="lucide:mail-warning">
        {{ $t('email_verification.not_verified') }}
      </UBadge>
    </div>
    <template v-if="!verified">
      <p class="text-sm text-dimmed">
        {{ sent ? $t('email_verification.sent', { email }) : $t('email_verification.description') }}
      </p>
      <UButton
        class="cursor-pointer self-start"
        variant="subtle"
        icon="lucide:send"
        :loading="sending"
        @click="send">
        {{ sent ? $t('email_verification.resend') : $t('email_verification.send') }}
      </UButton>
    </template>
  </div>
</template>

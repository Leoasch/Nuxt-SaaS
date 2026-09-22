<script setup lang="ts">
import { defineEmail } from '@lupinum/nuxt-email/define-email'

const props = defineProps<{
  resetUrl: string
}>()

defineEmail({
  subject: () => 'Reset your password',
})
</script>

<template>
  <ETailwind>
    <EHtml lang="en">
      <EHead>
        <title>Reset your password</title>
      </EHead>
      <EBody class="m-0 bg-slate-100 p-6">
        <EPreview>Reset your Nuxt SaaS password - this link expires in 1 hour.</EPreview>
        <EContainer class="rounded-lg bg-white p-6">
          <EHeading class="m-0 mb-4 text-2xl text-slate-900">
            <span class="text-[#00C16A]">Nuxt</span> SaaS
          </EHeading>
          <EText class="text-slate-600">
            We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.
          </EText>
          <EButton
            class="rounded-md bg-[#00C16A] px-5 py-3 text-white"
            :href="props.resetUrl">
            Reset your password
          </EButton>
          <EText class="mt-4 text-sm text-slate-400">
            If you did not request this, you can safely ignore this email.
          </EText>
        </EContainer>
      </EBody>
    </EHtml>
  </ETailwind>
</template>

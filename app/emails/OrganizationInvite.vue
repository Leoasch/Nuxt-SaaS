<script setup lang="ts">
import { defineEmail } from '@lupinum/nuxt-email/define-email'

const props = defineProps<{
  organizationName: string
  inviterName: string
  loginUrl: string
}>()

defineEmail({
  subject: () => `You've been invited to join ${props.organizationName}`,
})
</script>

<template>
  <ETailwind>
    <EHtml lang="en">
      <EHead>
        <title>Organization invite</title>
      </EHead>
      <EBody class="m-0 bg-slate-100 p-6">
        <EPreview>{{ inviterName }} invited you to join {{ organizationName }}</EPreview>
        <EContainer class="rounded-lg bg-white p-6">
          <EHeading class="m-0 mb-4 text-2xl text-slate-900">
            <span class="text-[#00C16A]">Nuxt</span> SaaS
          </EHeading>
          <EText class="text-slate-600">
            <strong>{{ props.inviterName }}</strong> invited you to join <strong>{{ props.organizationName }}</strong>.
          </EText>
          <EButton
            class="rounded-md bg-[#00C16A] px-5 py-3 text-white"
            :href="props.loginUrl">
            Log in to respond
          </EButton>
        </EContainer>
      </EBody>
    </EHtml>
  </ETailwind>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { defineEmail } from '@lupinum/nuxt-email/define-email'
import { emailMessages } from '~~/shared/emails/messages'
import type { AppLocale } from '~~/shared/utils/locales'

const props = defineProps<{
  verifyUrl: string
  locale: AppLocale
}>()

const messages = computed(() => emailMessages(props.locale).verifyEmail)

defineEmail({
  subject: () => emailMessages(props.locale).verifyEmail.subject,
})
</script>

<template>
  <ETailwind>
    <EHtml :lang="props.locale">
      <EHead>
        <title>{{ messages.subject }}</title>
      </EHead>
      <EBody class="m-0 bg-slate-100 p-6">
        <EPreview>{{ messages.preview }}</EPreview>
        <EContainer class="rounded-lg bg-white p-6">
          <EHeading class="m-0 mb-4 text-2xl text-slate-900">
            <span class="text-[#00C16A]">Nuxt</span> SaaS
          </EHeading>
          <EText class="text-slate-600">
            {{ messages.body }}
          </EText>
          <EButton
            class="rounded-md bg-[#00C16A] px-5 py-3 text-white"
            :href="props.verifyUrl">
            {{ messages.button }}
          </EButton>
          <EText class="mt-4 text-sm text-slate-400">
            {{ messages.footer }}
          </EText>
        </EContainer>
      </EBody>
    </EHtml>
  </ETailwind>
</template>

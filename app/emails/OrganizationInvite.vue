<script setup lang="ts">
import { computed } from 'vue'
import { defineEmail } from '@lupinum/nuxt-email/define-email'
import { emailMessages } from '~~/shared/emails/messages'
import type { AppLocale } from '~~/shared/utils/locales'

const props = defineProps<{
  organizationName: string
  inviterName: string
  loginUrl: string
  locale: AppLocale
}>()

const messages = computed(() => emailMessages(props.locale).organizationInvite)
const params = computed(() => ({ inviterName: props.inviterName, organizationName: props.organizationName }))

defineEmail({
  subject: () => emailMessages(props.locale).organizationInvite.subject(params.value),
})
</script>

<template>
  <ETailwind>
    <EHtml :lang="props.locale">
      <EHead>
        <title>{{ messages.title }}</title>
      </EHead>
      <EBody class="m-0 bg-slate-100 p-6">
        <EPreview>{{ messages.preview(params) }}</EPreview>
        <EContainer class="rounded-lg bg-white p-6">
          <EHeading class="m-0 mb-4 text-2xl text-slate-900">
            <span class="text-[#00C16A]">Nuxt</span> SaaS
          </EHeading>
          <EText class="text-slate-600">
            <template
              v-for="(part, index) in messages.body(params)"
              :key="index">
              <strong v-if="typeof part === 'object'">{{ part.strong }}</strong>
              <template v-else>{{ part }}</template>
            </template>
          </EText>
          <EButton
            class="rounded-md bg-[#00C16A] px-5 py-3 text-white"
            :href="props.loginUrl">
            {{ messages.button }}
          </EButton>
        </EContainer>
      </EBody>
    </EHtml>
  </ETailwind>
</template>

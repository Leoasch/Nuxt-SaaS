<script setup lang="ts">
import { getOrganizationInvites } from '~/api/organization'
import type { Membership } from '~~/shared/types'
import WidgetBox from './WidgetBox.vue'
import InviteNotification from '../Notifications/InviteNotification.vue'
import Notification from '../Notifications/Notification.vue'


const invites = ref<Membership[]>([])
const loading = ref<boolean>(false)
const {
  email,
  verified,
  sending,
  sent,
  load: loadEmailVerification,
  send: sendVerificationEmail
} = useEmailVerification()

async function loadInvites () {
  loading.value = true
  try {
    const result = await getOrganizationInvites()
    if (result.invites) {
      invites.value = result.invites
    }
  } finally {
    loading.value = false
  }
}

function refresh () {
  loadEmailVerification().catch(() => {})
  loadInvites()
}

onMounted(refresh)

</script>

<template>
  <WidgetBox class="p-2">
    <div class="size-full flex flex-col gap-1 overflow-auto p-1">
      <div class="flex justify-end">
        <UButton
          icon="lucide:refresh-cw"
          color="neutral"
          variant="ghost"
          class="cursor-pointer"
          :aria-label="$t('common.refresh')"
          :ui="{
            leadingIcon: 'hover:rotate-90 transition-transform duration-300'
          }"
          @click="refresh"
        />
      </div>
      <USeparator/>
      <Notification
        v-if="verified === false"
        class="gap-2">
        <UIcon
          name="lucide:mail-warning"
          class="mx-1 size-5 shrink-0 text-warning"/>
        <div class="flex min-w-0 flex-col">
          <span class="font-bold">{{ $t('email_verification.notification') }}</span>
          <span class="truncate text-xs text-dimmed">{{ email }}</span>
        </div>
        <UButton
          class="ml-auto shrink-0 cursor-pointer"
          variant="ghost"
          :icon="sent ? 'lucide:check' : 'lucide:send'"
          :loading="sending"
          :disabled="sent"
          @click="sendVerificationEmail">
          {{ sent ? $t('email_verification.sent_short') : $t('email_verification.send_short') }}
        </UButton>
      </Notification>
      <Loadable
        :loading
        class="size-full flex flex-col"
      >
        <template v-if="invites.length">
          <InviteNotification 
            v-for="(invite, idx) in invites" 
            :key="idx"
            :invite
            class="hover:scale-101 transition-transform duration-200"
            @remove="invites.splice(idx, 1)"
          />
        </template>
        <template v-else>
          <span class="text-dimmed w-full text-center">{{ $t('organization.no_pending_invites') }}</span>
        </template>
      </Loadable>
    </div>
  </WidgetBox>
</template>
<script setup lang="ts">
import { ROLE_STYLES } from '~/common'
import type { Membership } from '~~/shared/types'
import Notification from './Notification.vue'
import { acceptOrganizationInvite } from '~/api/organization.ts'
import ConfirmDialog from '../ConfirmDialog.vue'

const props = defineProps<{
  invite: Membership
}>()

const overlay = useOverlay()
const emits = defineEmits(['remove'])

async function acceptInvite () {
  const result = await acceptOrganizationInvite(props.invite.organization_id, true)
  if (!result.membership.pending_invite) {
    emits('remove')
  }
}

async function declineInvite () {
  const dialog = overlay.create(ConfirmDialog, {
    props: { title: $t('confirm_decline_title'), description: $t('confirm_decline_description') }
  }).open()
  if (await dialog.result) {
    const result = await acceptOrganizationInvite(props.invite.organization_id, false)
    if (result.membership.pending_invite) {
      emits('remove')
    }
  }
}

</script>

<template>
  <Notification>
    <div class="flex  gap-2">
      <ULink 
        class="font-bold"
        :to="`/organization/${invite.organization_id}`"
      >{{ invite.organization?.name }}</ULink>
      <UBadge
        :color="ROLE_STYLES[invite.role].color"
        :icon="ROLE_STYLES[invite.role].icon"
        variant="subtle"
        class="shrink-0">
        {{ $t(ROLE_STYLES[invite.role].label) }}
      </UBadge>
    </div>
    <div class="ml-auto mr-0 flex gap-1">
      <UButton
        icon="lucide:x"
        color="error"
        variant="ghost"
        class="cursor-pointer p-1"
        @click="declineInvite"
      />
      <UButton
        icon="lucide:check"
        color="primary"
        variant="ghost"
        class="cursor-pointer p-1"
        @click="acceptInvite"
      />
    </div>
  </Notification>
</template>
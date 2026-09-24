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
const { toastApiError } = useApiError()

async function acceptInvite () {
  try {
    const result = await acceptOrganizationInvite(props.invite.organization_id, true)
    if (!result.membership.pending_invite) {
      emits('remove')
    }
  } catch (error) {
    toastApiError(error)
  }
}

async function declineInvite () {
  const dialog = overlay.create(ConfirmDialog, {
    props: {
      title: $t('organization.confirm_decline_title'),
      description: $t('organization.confirm_decline_description'),
      confirmLabel: $t('organization.decline_invite')
    }
  }).open()
  if (await dialog.result) {
    try {
      const result = await acceptOrganizationInvite(props.invite.organization_id, false)
      if (result.membership.pending_invite) {
        emits('remove')
      }
    } catch (error) {
      toastApiError(error)
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
        {{ $t('role.' + invite.role) }}
      </UBadge>
    </div>
    <div class="ml-auto mr-0 flex gap-1">
      <UButton
        icon="lucide:x"
        color="error"
        variant="ghost"
        class="cursor-pointer p-1"
        :aria-label="$t('organization.decline_invite')"
        @click="declineInvite"
      />
      <UButton
        icon="lucide:check"
        color="primary"
        variant="ghost"
        class="cursor-pointer p-1"
        :aria-label="$t('organization.accept_invite')"
        @click="acceptInvite"
      />
    </div>
  </Notification>
</template>

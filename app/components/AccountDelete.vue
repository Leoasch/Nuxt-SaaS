<script setup lang="ts">
import ConfirmDeleteAccountDialog from '~/components/ConfirmDeleteAccountDialog.vue'

const { organizations } = useOrganization()
const { clear } = useUserSession()
const overlay = useOverlay()

async function handleDelete () {
  const blockingOrganizations = organizations.value
    .filter(org => org.role === 'OWNER' && org.is_member)
    .map(org => org.name)

  const dialog = overlay.create(ConfirmDeleteAccountDialog, {
    props: { blockingOrganizations }
  }).open()

  const deleted = await dialog.result

  if (!deleted) {
    return
  }

  await clear()
  await navigateTo('/auth/login')
}
</script>

<template>
  <div>
    <UButton
      color="error"
      variant="subtle"
      icon="lucide:trash-2"
      class="cursor-pointer"
      @click="handleDelete"
    >
      {{ $t('account.delete_button') }}
    </UButton>
  </div>
</template>

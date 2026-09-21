<script setup lang="ts">
import { getOwnedOrganizations } from '~/api/organization'
import ConfirmDeleteAccountDialog from '~/components/ConfirmDeleteAccountDialog.vue'

const { clear } = useUserSession()
const overlay = useOverlay()
const loading = ref(false)

async function loadBlockingOrganizations () {
  try {
    const result = await getOwnedOrganizations()
    return result.organizations.map(org => org.name)
  } catch {
    return []
  }
}

async function handleDelete () {
  loading.value = true
  const blockingOrganizations = await loadBlockingOrganizations()
  loading.value = false

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
  <UButton
    color="error"
    variant="subtle"
    icon="lucide:trash-2"
    class="cursor-pointer"
    :loading="loading"
    @click="handleDelete"
  >
    {{ $t('account.delete_button') }}
  </UButton>
</template>

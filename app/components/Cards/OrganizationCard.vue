<script setup lang="ts">
import { acceptOrganizationInvite, deleteOrganization, getOrganizations } from '~/api/organization'
import type { Organization } from '~~/shared/types'
import OrganizationForm from '../Forms/OrganizationForm.vue'
import ConfirmDeleteDialog from '../ConfirmDeleteDialog.vue'
import { ROLE_STYLES } from '~/common.ts'
import ConfirmDialog from '../ConfirmDialog.vue'

const props = defineProps<{
  organizationId: string
}>()

const organization = ref<Organization | null>(null)
const loading = ref(false)
const { loadOrganizations, selectedOrganizationId } = useOrganization()
const overlay = useOverlay()
const emits = defineEmits(['close'])
const roleStyle = computed(() => organization.value ? ROLE_STYLES[organization.value.role] : null)
const isAdminUser = computed(() => organization.value?.role === 'ADMIN' && organization.value?.is_member)

async function onLoad () {
  try {
    loading.value = true
    const result = await getOrganizations(props.organizationId)
    if (result.organization) {
      organization.value = result.organization
    }
  } finally {
    loading.value = false
  }
}

async function onEdit () {
  if (organization.value) {
    const dialog = overlay.create(OrganizationForm, {
      props: { organization: organization.value }
    }).open()
    if (await dialog.result) {
      await onLoad()
    }
  }
}

async function onDelete () {
  const dialog = overlay.create(ConfirmDeleteDialog, {
    props: {
      title: $t('organization.confirm_delete.title'),
      description: $t('organization.confirm_delete.description'),
    }
  }).open()
  if (await dialog.result) {
    if (organization.value) {
      const result = await deleteOrganization(organization.value.id)
      if (result.organization) {
        useToast().add({
          description: $t('organization.delete_success'),
          color: 'success'
        })
        await loadOrganizations()
        emits('close')
      }
    }
  }
}

async function acceptInvite () {
  const result = await acceptOrganizationInvite(props.organizationId, true)
  if (!result.membership.pending_invite) {
    accessConfigs()
  }
}

async function declineInvite () {
  const dialog = overlay.create(ConfirmDialog, {
    props: { title: $t('confirm_decline_title'), description: $t('confirm_decline_description') }
  }).open()
  if (await dialog.result) {
    const result = await acceptOrganizationInvite(props.organizationId, false)
    if (result.membership.pending_invite) {
      await loadOrganizations()
      emits('close')
    }
  }
}

function accessConfigs () {
  navigateTo(`organization/${organization.value?.id}`)
  emits('close')
}


onMounted(() => {
})
</script>

<template>
  <CardsBase
    :loading
    :can-delete="isAdminUser"
    :can-edit="isAdminUser"
    @load="onLoad"
    @edit="onEdit"
    @delete="onDelete"
  >
    <div
      v-if="organization"
      class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <NameInitialsImage
          :name="organization.name"
          class="size-14 shrink-0"
        />
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-lg font-bold">{{ organization.name }}</h1>
          <UBadge
            v-if="roleStyle"
            :color="roleStyle.color"
            :icon="roleStyle.icon"
            variant="subtle"
            class="mt-1">
            {{ $t(roleStyle.label) }}
          </UBadge>
        </div>
      </div>

      <div
        v-if="organization.document"
        class="flex flex-col rounded border border-accented bg-accented/20 dark:bg-accented/30">
        <div class="flex items-center gap-2 p-2">
          <UIcon
            name="lucide:id-card"
            class="size-4 shrink-0 text-dimmed"/>
          <span class="truncate">{{ organization.document }}</span>
        </div>
      </div>
    </div>
    <template #footer-btns>
      <UButton
        :disabled="loading"
        variant="ghost"
        color="neutral"
        class="cursor-pointer"
        @click="accessConfigs"
      >
        {{ $t('organization.page') }}
      </UButton>
      <template v-if="organization?.is_member">
        <UButton
          
          :disabled="loading || (selectedOrganizationId === organizationId)"
          variant="ghost"
          color="secondary"
          class="cursor-pointer"
          @click="() => selectedOrganizationId = organizationId"
        >
          {{ $t('organization.select') }}
        </UButton>
      </template>
      <template v-else>
        <UButton
          :disabled="loading"
          variant="ghost"
          color="error"
          class="cursor-pointer"
          @click="declineInvite"
        >
          {{ $t('organization.decline_invite') }}
        </UButton>
        <UButton
          :disabled="loading"
          variant="ghost"
          color="primary"
          class="cursor-pointer"
          @click="acceptInvite"
        >
          {{ $t('organization.accept_invite') }}
        </UButton>
      </template>
    </template>
  </CardsBase>
</template>

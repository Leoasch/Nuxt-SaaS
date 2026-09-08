<script setup lang="ts">
import { deleteOrganization, getOrganizations } from '~/api/organization'
import type { Organization, Role } from '~~/shared/types'
import OrganizationForm from '../Forms/OrganizationForm.vue'
import ConfirmDeleteDialog from '../ConfirmDeleteDialog.vue'

const props = defineProps<{
  organizationId: string
}>()

const ROLE_STYLES: Record<Role, { label: string; color: 'error' | 'warning' | 'neutral'; icon: string }> = {
  ADMIN: { label: 'Admin', color: 'error', icon: 'i-lucide-shield-check' },
  MANAGER: { label: 'Manager', color: 'warning', icon: 'i-lucide-briefcase' },
  EMPLOYEE: { label: 'Employee', color: 'neutral', icon: 'i-lucide-user' },
}

const organization = ref<Organization | null>(null)
const loading = ref(false)
const { loadOrganizations } = useOrganization()
const overlay = useOverlay()
const emits = defineEmits(['close'])

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

const roleStyle = computed(() => organization.value ? ROLE_STYLES[organization.value.role] : null)
</script>

<template>
  <CardsBase
    :loading
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
            {{ roleStyle.label }}
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
  </CardsBase>
</template>

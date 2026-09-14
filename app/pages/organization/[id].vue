<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { acceptOrganizationInvite, deleteMember, deleteOrganization, getOrganizationMembers, getOrganizations, transferOwnership } from '~/api/organization'
import { ROLE_STYLES } from '~/common'
import ConfirmDeleteDialog from '~/components/ConfirmDeleteDialog.vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'
import ConfirmTransferOwnershipDialog from '~/components/ConfirmTransferOwnershipDialog.vue'
import InviteForm from '~/components/Forms/InviteForm.vue'
import OrganizationForm from '~/components/Forms/OrganizationForm.vue'
import type { Membership, Organization } from '~~/shared/types'
import { hasMinimumRole } from '~~/shared/utils/roles.ts'

const route = useRoute()
const org_id = route.params.id as string
const organization = ref<Organization | null>(null)
const members = ref<Membership[]>([])
const loading = ref<boolean>(false)
const overlay = useOverlay()
const { user } = useUserSession()

async function loadOrganization () {
  if (org_id) {
    const result = await getOrganizations(org_id)
    if (result.organization) {
      organization.value = result.organization
    }
  }
}

async function loadMembers () {
  if (org_id && user.value) {
    const result = await getOrganizationMembers(org_id)
    if (result.memberships) {
      members.value = result.memberships
    }
  }
}

const sortedMembers = computed(() => [...members.value].sort((a, b) => {
  if (a.pending_invite !== b.pending_invite) {
    return a.pending_invite ? 1 : -1
  }
  return ROLE_RANK[a.role] - ROLE_RANK[b.role]
}))

const items = computed<DropdownMenuItem[]>(() => {
  const arr: DropdownMenuItem[] = []
  if (!organization.value) {
    return arr
  }
  
  if (hasMinimumRole(organization.value?.role, 'ADMIN')) {
    arr.push({
      label: 'organization.edit_organization',
      icon: 'lucide:pencil',
      onSelect: openEditForm
    })
  }

  if (hasMinimumRole(organization.value?.role, 'OWNER')) {
    arr.push({
      label: 'organization.delete_organization',
      color: 'error',
      icon: 'lucide:trash',
      onSelect: deleteOrganizationForm
    })
  }

  return arr
})

async function deleteOrganizationForm () {
  if (!organization.value) {
    return
  }
  const dialog = overlay.create(ConfirmTransferOwnershipDialog, {
    props: {
      title: $t('organization.delete_organization_title'),
      description: $t('organization.delete_organization_description'),
      email: user.value?.email ?? ''
    }
  }).open()
  if (await dialog.result) {
    const result = await deleteOrganization(organization.value.id)
    if (result.organization) {
      navigateTo('/organizations')
    }
  }
}

async function openEditForm () {
  if (organization.value) {
    const dialog = overlay.create(OrganizationForm, {
      props: { organization: organization.value }
    }).open()
    if (await dialog.result) {
      await loadOrganization()
    }
  }
}


async function openInviteForm (member?: Membership) {
  if (!organization.value) {
    return
  }
  const dialog = overlay.create(InviteForm, {
    props: {
      orgId: organization.value.id,
      currentUserRole: organization.value.role,
      member
    }
  }).open()
  if (await dialog.result) {
    await loadOrganization()
    await loadMembers()
  }
}

async function removeMember (
  member: Membership, 
  dialogBody: { title: string, description: string },
  dialogComponent = ConfirmDialog,
  onQuit = async () => await loadMembers()
) {
  if (!organization.value) {
    return
  }
  const dialog = overlay.create(dialogComponent, {
    props: {
      title: dialogBody.title,
      description: dialogBody.description
    }
  }).open()
  if (await dialog.result) {
    await deleteMember(member)
    await onQuit()
  }
}

async function kickMember (member: Membership) {
  await removeMember(
    member,
    {
      title: $t('member.kick_title'),
      description: $t('member.kick_description')
    }
  )
}

async function cancelInvitation (member: Membership) {
  await removeMember(
    member,
    {
      title: $t('member.cancel_invite_title'),
      description: $t('member.cancel_invite_description')
    }
  )
}

async function quitOrganization (member: Membership) {
  await removeMember(
    member,
    {
      title: $t('member.confirm_exit_title'),
      description: $t('member.confirm_exit_description')
    },
    ConfirmDeleteDialog,
    async () => {
      navigateTo('/organizations')
    }
  )
}

async function transferOwnershipTo (member: Membership) {
  if (!organization.value) {
    return
  }
  const dialog = overlay.create(ConfirmTransferOwnershipDialog, {
    props: {
      title: $t('member.transfer_ownership_title'),
      description: $t('member.transfer_ownership_description'),
      email: member.user?.email ?? ''
    }
  }).open()
  if (await dialog.result) {
    await transferOwnership(member)
    await Promise.all([loadOrganization(), loadMembers()])
  }
}

async function acceptInvite () {
  if (!organization.value) {
    return
  }
  const result = await acceptOrganizationInvite(organization.value.id, true)
  if (!result.membership.pending_invite) {
    await loadMembers()
    organization.value.is_member = true
  }
}

async function declineInvite () {
  if (!organization.value) {
    return
  }
  const dialog = overlay.create(ConfirmDialog, {
    props: { title: $t('confirm_decline_title'), description: $t('confirm_decline_description') }
  }).open()
  if (await dialog.result) {
    const result = await acceptOrganizationInvite(organization.value.id, false)
    if (result.membership.pending_invite) {
      organization.value = null
      navigateTo('/')
    }
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([loadOrganization(), loadMembers()])
  } finally {
    loading.value = false
  }
})

</script>

<template>
  <UContainer class="size-full flex flex-col">
    <Loadable
      :loading
      class="size-full">
      <div
        v-if="organization"
        class="flex flex-col gap-6">
        <div class="flex items-center gap-3">
          <NameInitialsImage
            :name="organization.name"
            class="size-14 shrink-0"
          />
          <div class="min-w-0 flex-1">
            <h1 class="truncate text-2xl font-bold">{{ organization.name }}</h1>
            <div class="flex gap-1 mt-1">
              <UBadge
                v-if="!organization.is_member"
                color="neutral"
                variant="subtle"
                icon="lucide:clock"
                :class="!organization.is_member ? 'opacity-60' : ''"
                class="shrink-0"
              >
                {{ $t('member.pending') }}
              </UBadge>
              <UBadge
                :color="ROLE_STYLES[organization.role].color"
                :icon="ROLE_STYLES[organization.role].icon"
                variant="subtle"
                :class="!organization.is_member ? 'opacity-60' : ''"
              >
                {{ $t(ROLE_STYLES[organization.role].label) }}
              </UBadge>
            </div>
          </div>

          <UDropdownMenu
            v-if="hasMinimumRole(organization.role, 'ADMIN')"
            :items
            class="shrink-0"
          >
            <UButton
              icon="lucide:ellipsis-vertical"
              color="neutral"
              variant="ghost"
              class="cursor-pointer"
            />
          </UDropdownMenu>
        </div>

        <div
          v-if="organization.document"
          class="flex items-center gap-2 rounded border border-accented bg-accented/20 p-2 dark:bg-accented/30">
          <UIcon
            name="lucide:id-card"
            class="size-4 shrink-0 text-dimmed"/>
          <span class="truncate">{{ organization.document }}</span>
        </div>

        <USeparator/>
        <template v-if="organization.is_member">
          <div>
            <div class="flex items-center mb-3">
              <h2 class="text-lg font-bold">{{ $t('organization.members') }}</h2>
              <UButton
                v-if="hasMinimumRole(organization.role, 'MANAGER')"
                color="primary"
                variant="subtle"
                class="ml-auto mr-0 cursor-pointer font-bold"
                @click="() => openInviteForm()"
              >
                {{ $t('invite') }}
              </UButton>
            </div>
            <p
              v-if="members.length === 0"
              class="text-sm text-dimmed">
              {{ $t('organization.no_members') }}
            </p>
            <div
              v-else
              class="flex flex-col gap-2">
              <MemberItem
                v-for="member in sortedMembers"
                :key="member.id"
                :member
                :organization
                @alter_permission="() => openInviteForm(member)"
                @cancel_invite="() => cancelInvitation(member)"
                @member_kick="() => kickMember(member)"
                @member_quit="() => quitOrganization(member)"
                @transfer_ownership="() => transferOwnershipTo(member)"
              />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col items-center size-full">
            <p>{{ $t('organization.invite_text') }}</p>
            <div class="flex flex-wrap items-center justify-center">              
              <UButton
                icon="lucide:x"
                :disabled="loading"
                variant="ghost"
                color="error"
                class="cursor-pointer"
                @click="declineInvite"
              >
                {{ $t('organization.decline_invite') }}
              </UButton>    
              <UButton
                icon="lucide:check"
                :disabled="loading"
                variant="ghost"
                color="primary"
                class="cursor-pointer"
                @click="acceptInvite"
              >
                {{ $t('organization.accept_invite') }}
              </UButton>          
            </div>
          </div>
        </template>
      </div>
      <p
        v-else
        class="text-sm text-dimmed">
        {{ $t('organization.not_found') }}
      </p>
    </Loadable>
  </UContainer>
</template>
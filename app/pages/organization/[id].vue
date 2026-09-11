<script setup lang="ts">
import { getOrganizationMembers, getOrganizations } from '~/api/organization'
import { ROLE_STYLES } from '~/common'
import InviteForm from '~/components/Forms/InviteForm.vue'
import type { Membership, Organization } from '~~/shared/types'


const route = useRoute()
const org_id = route.params.id as string
const organization = ref<Organization | null>(null)
const members = ref<Membership[]>([])
const loading = ref<boolean>(false)
const overlay = useOverlay()

async function loadOrganization () {
  if (org_id) {
    const result = await getOrganizations(org_id)
    if (result.organization) {
      organization.value = result.organization
    }
  }
}

async function loadMembers () {
  const { user } = useUserSession()
  if (org_id && user.value) {
    const result = await getOrganizationMembers(org_id)
    if (result.memberships) {
      members.value = result.memberships
    }
  }
}

const sortedMembers = computed(() => [...members.value].sort((a, b) => Number(a.pending_invite) - Number(b.pending_invite)))

async function openInviteForm () {
  if (!organization.value) {
    return
  }
  overlay.create(InviteForm, {
    props: {
      orgId: organization.value.id,
      currentUserRole: organization.value.role
    }
  }).open()
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
                {{ ROLE_STYLES[organization.role].label }}
              </UBadge>
            </div>
          </div>
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

        <div v-if="organization.is_member">
          <div class="flex items-center mb-3">
            <h2 class="text-lg font-bold">{{ $t('organization.members') }}</h2>
            <UButton
              color="primary"
              variant="subtle"
              class="ml-auto mr-0 cursor-pointer font-bold"
              @click="openInviteForm"
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
            />
          </div>
        </div>
      </div>
      <p
        v-else
        class="text-sm text-dimmed">
        {{ $t('organization.not_found') }}
      </p>
    </Loadable>
  </UContainer>
</template>
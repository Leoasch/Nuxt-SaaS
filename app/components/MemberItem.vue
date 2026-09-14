<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { ROLE_STYLES } from '~/common'
import type { Membership } from '~~/shared/types'
import { hasMinimumRole } from '~~/shared/utils/roles.ts'

const props = defineProps<{
  member: Membership
}>()

const { user } = useUserSession()
const { organizations } = useOrganization()

const userRole = computed(() => {
  return organizations.value.find((org) => org.id === props.member.organization_id)?.role
})

const roleCheck = () => {
  return !!userRole.value && hasMinimumRole(userRole.value, props.member.role)
}

const emits = defineEmits(['alter_permission', 'cancel_invite', 'member_quit', 'member_kick'])

const items = computed<DropdownMenuItem[]>(() => {
  const arr: DropdownMenuItem[] = []

  if (props.member.role === 'OWNER') {
    return arr
  }

  if (props.member.pending_invite) {
    arr.push({
      label: $t('member.cancel_invite'),
      icon: 'lucide:user-round-x',
      color: 'error',
      onSelect: () => emits('cancel_invite')
    })
  } else if (props.member.user_id === user.value?.id) {
    arr.push({
      label: $t('member.quit'),
      icon: 'lucide:square-arrow-right-exit',
      color: 'error',
      onSelect: () => emits('member_quit')
    })
  } else if (roleCheck()) {
    arr.push({
      label: $t('member.kick'),
      icon: 'lucide:square-arrow-right-exit',
      color: 'error',
      onSelect: () => emits('member_kick')
    })
  }

  if (roleCheck()) {
    arr.push({
      label: $t('member.alter_permission'),
      icon: 'lucide:pencil',
      onSelect: () => emits('alter_permission')
    })
  }

  return arr
})

</script>

<template>
  <div
    class="flex w-full items-center gap-3 rounded border border-accented bg-accented/20 p-2 dark:bg-accented/30"
    :class="member.pending_invite ? 'opacity-60' : ''">
    <NameInitialsImage
      :name="member.user?.name ?? member.user_id"
      class="size-10 shrink-0"
    />
    <div class="min-w-0 flex-1">
      <h3 class="truncate font-bold">{{ member.user?.name ?? member.user_id }}</h3>
      <div class="flex flex-wrap items-center gap-1.5">
        <span
          v-if="member.user?.email"
          class="truncate text-xs text-dimmed">{{ member.user.email }}</span>
        <UBadge
          v-if="member.pending_invite"
          color="neutral"
          variant="subtle"
          icon="lucide:clock"
          size="sm"
          class="shrink-0">
          {{ $t('member.pending') }}
        </UBadge>
        <UBadge
          :color="ROLE_STYLES[member.role].color"
          :icon="ROLE_STYLES[member.role].icon"
          variant="subtle"
          size="sm"
          class="shrink-0">
          {{ $t(ROLE_STYLES[member.role].label) }}
        </UBadge>
      </div>
    </div>
    <UDropdownMenu
      :disabled="!items.length"
      :items
      class="shrink-0"
      :class="!items.length ? 'opacity-60' : ''"  
    >
      <UButton
        icon="lucide:ellipsis-vertical"
        color="neutral"
        variant="ghost"
        class="cursor-pointer"
      />
    </UDropdownMenu>
  </div>
</template>
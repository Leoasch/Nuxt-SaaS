<script setup lang="ts">
import { ROLE_STYLES } from '~/common'
import type { Membership } from '~~/shared/types'

defineProps<{
  member: Membership
}>()

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
      <span
        v-if="member.user?.email"
        class="truncate text-xs text-dimmed">{{ member.user.email }}</span>
    </div>
    <UBadge
      v-if="member.pending_invite"
      color="neutral"
      variant="subtle"
      icon="lucide:clock"
      class="shrink-0">
      {{ $t('member.pending') }}
    </UBadge>
    <UBadge
      :color="ROLE_STYLES[member.role].color"
      :icon="ROLE_STYLES[member.role].icon"
      variant="subtle"
      class="shrink-0">
      {{ ROLE_STYLES[member.role].label }}
    </UBadge>
  </div>
</template>
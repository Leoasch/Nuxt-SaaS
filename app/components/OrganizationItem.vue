<script setup lang="ts">
import { ROLE_STYLES } from '~/common'

const props = defineProps<{
  organization: Organization
}>()

const roleStyle = computed(() => ROLE_STYLES[props.organization.role])
</script>

<template>
  <UCard
    class="cursor-pointer"
    :class="!organization.is_member ? 'opacity-60' : ''"
    :ui="{
      root: `border-l-4 ${roleStyle.accent}`,
      header: 'bg-accented-900/80',
      title: 'font-bold truncate',
      body: 'bg-linear-to-r from-accented/30 to-accented/10'
    }"
    variant="soft"
    :title="organization.name"
  >
    <p class="min-h-5 truncate text-dimmed">{{ organization.document }}</p>
    <div class="flex flex-col items-start gap-2">
      <div class="flex gap-1">
        <UBadge
          :color="roleStyle.color"
          :icon="roleStyle.icon"
          variant="subtle"
        >
          {{ $t(roleStyle.label) }}
        </UBadge>
        <UBadge
          color="neutral"
          icon="lucide:clock"
          variant="subtle"
          :class="organization.is_member ? 'invisible' : ''"
        >
          {{ $t('pending') }}
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

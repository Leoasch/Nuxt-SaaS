<script setup lang="ts">
import type { PropType } from 'vue'
import type { Role } from '~~/shared/types'

const props = defineProps({
  name: {
    type: String,
    default: () => ''
  },
  document: {
    type: String,
    required: false,
    nullable: true,
    default: () => ''
  },
  role: {
    type: String as PropType<Role>,
    default: () => 'EMPLOYEE' as Role
  },
})

const ROLE_STYLES: Record<Role, { label: string; color: 'error' | 'warning' | 'neutral'; icon: string; accent: string }> = {
  ADMIN: { label: 'Admin', color: 'error', icon: 'i-lucide-shield-check', accent: 'border-l-error' },
  MANAGER: { label: 'Manager', color: 'warning', icon: 'i-lucide-briefcase', accent: 'border-l-warning' },
  EMPLOYEE: { label: 'Employee', color: 'neutral', icon: 'i-lucide-user', accent: 'border-l-neutral' },
}

const roleStyle = computed(() => ROLE_STYLES[props.role])
</script>

<template>
  <UCard
    :ui="{
      root: `border-l-4 ${roleStyle.accent}`,
      header: 'bg-accented-900/80',
      title: 'font-bold',
      body: 'bg-linear-to-r from-accented/30 to-accented/10'
    }"
    variant="soft"
    :title="name"
  >
    <h1 v-if="document">{{ document }}</h1>
    <UBadge
      :color="roleStyle.color"
      :icon="roleStyle.icon"
      variant="subtle"
    >
      {{ roleStyle.label }}
    </UBadge>
  </UCard>
</template>

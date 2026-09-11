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
    :ui="{
      root: `border-l-4 ${roleStyle.accent}`,
      header: 'bg-accented-900/80',
      title: 'font-bold',
      body: 'bg-linear-to-r from-accented/30 to-accented/10'
    }"
    variant="soft"
    :title="organization.name"
  >
    <h1 v-if="organization.document">{{ organization.document }}</h1>
    <UBadge
      :color="roleStyle.color"
      :icon="roleStyle.icon"
      variant="subtle"
    >
      {{ roleStyle.label }}
    </UBadge>
  </UCard>
</template>

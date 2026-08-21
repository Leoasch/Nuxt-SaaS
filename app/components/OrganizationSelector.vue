<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'

const { organizations, selectedOrganizationId } = useOrganization()

const organizationsItems = computed<SelectItem[]>(() => {
  const loadedOrgs = organizations.value.map(org => ({
    label: org.name,
    value: org.id
  }))
  return [
    {
      label: $t('(none)'),
      value: null
    },
    ...loadedOrgs
  ]
})

</script>

<template>
  <USelect
    v-model="selectedOrganizationId"
    :items="organizationsItems"
  >
    <template #content-bottom>
      <UButton icon="lucide:plus">New</UButton>
    </template>
  </USelect>
</template>
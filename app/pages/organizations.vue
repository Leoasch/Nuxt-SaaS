<script setup lang="ts">
import OrganizationCard from '~/components/Cards/OrganizationCard.vue'

const { organizations } = useOrganization()
const overlay = useOverlay()

function openOrganizationCard (id: string) {
  overlay.create(OrganizationCard, { props: { organizationId: id } }).open()
}

</script>
<template>
  <UContainer>
    <div class="flex">
      <h1 class="font-bold text-2xl">Organizations</h1>
      <CreateOrganizationBtn class="ml-auto mr-2"/>
    </div>
    <USeparator class="py-3"/>
    <div class="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-6">
      <template
        v-for="organization in organizations"
        :key="organization.id">
        <OrganizationItem
          :organization
          @click="() => openOrganizationCard(organization.id)"
        />
      </template>
    </div>
  </UContainer>
</template>
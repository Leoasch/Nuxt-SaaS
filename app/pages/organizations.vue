<script setup lang="ts">

const { organizations } = useOrganization()

</script>
<template>
  <UContainer>
    <h1 class="font-bold text-2xl">Organizations</h1>
    <USeparator class="py-3"/>
    <div class="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-6">
      <template
        v-for="organization in organizations"
        :key="organization.id">
        <OrganizationCard
          :name="organization.name"
          :role="organization.role"
          :document="organization.document ?? undefined"
        />
      </template>
    </div>
  </UContainer>
</template>
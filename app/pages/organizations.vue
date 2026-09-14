<script setup lang="ts">
import OrganizationCard from '~/components/Cards/OrganizationCard.vue'

const { organizations, loadOrganizations } = useOrganization()
const overlay = useOverlay()
const loading = ref(false)

async function loadData () {
  try {
    loading.value = true
    await loadOrganizations()
  } finally {
    loading.value = false
  }
}

function openOrganizationCard (id: string) {
  overlay.create(OrganizationCard, { props: { organizationId: id } }).open()
}

</script>
<template>
  <UContainer>
    <div class="flex">
      <h1 class="font-bold text-2xl">{{ $t('organizations') }}</h1>
      <UButton
        icon="lucide:refresh-cw"
        color="neutral"
        variant="ghost"
        class="cursor-pointer ml-3"
        :ui="{
          leadingIcon: 'hover:rotate-90 transition-transform duration-300'
        }"
        @click="loadData"
      />
      <CreateOrganizationBtn class="ml-auto mr-2"/>
    </div>
    <USeparator class="py-3"/>
    <Loadable :loading>
      <p
        v-if="organizations.length === 0"
        class="text-dimmed text-sm">
        {{ $t('organization.no_organizations') }}
      </p>
      <div
        v-else
        class="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-6">
        <template
          v-for="organization in organizations"
          :key="organization.id">
          <OrganizationItem
            :organization
            @click="() => openOrganizationCard(organization.id)"
          />
        </template>
      </div>
    </Loadable>
  </UContainer>
</template>
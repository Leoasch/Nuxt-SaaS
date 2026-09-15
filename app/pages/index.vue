<script setup lang="ts">
import PendingInvites from '~/components/Widgets/PendingInvites.vue'

const { selectedOrganizationId } = useOrganization()
</script>

<template>
  <div class="flex flex-col gap-4">
    <KpiTiles
      v-if="selectedOrganizationId"
      :org-id="selectedOrganizationId"
    />
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <RevenueChart
          v-if="selectedOrganizationId"
          :org-id="selectedOrganizationId"
        />
        <div
          v-else
          class="flex size-full min-h-64 flex-col items-center justify-center rounded border border-accented bg-accented/20 p-4 dark:bg-accented/30">
          <NoOrganizationIcon class="mb-2 size-14"/>
          <h1 class="text-dimmed">{{ $t('page.no_organization_selected') }}</h1>
        </div>
      </div>
      <PendingInvites class="min-h-64"/>
    </div>
  </div>
</template>

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
    <div class="grid gap-4 lg:grid-cols-3">
      <template v-if="selectedOrganizationId">
        <RevenueChart
          class="lg:col-span-2"
          :org-id="selectedOrganizationId"
        />
        <LowStockProducts
          :org-id="selectedOrganizationId"
          class="max-h-80"
        />
        <ProfitByProductChart
          :org-id="selectedOrganizationId"
          class="h-80"
        />
        <TopSellingProductsChart
          :org-id="selectedOrganizationId"
          class="h-80"
        />
      </template>
      <PendingInvites class="min-h-64"/>
    </div>
  </div>
</template>

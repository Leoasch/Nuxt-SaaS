<script setup lang="ts">
import StockMovementItem from '~/components/StockMovementItem.vue'
import StockMovementCard from '~/components/Cards/StockMovementCard.vue'

const { stock, loadStock, productFilter } = useStock()
const { selectedOrganizationId, selectedOrganization } = useOrganization()
const overlay = useOverlay()

function openStockMovementCard (id: string) {
  overlay.create(StockMovementCard, { props: { stockId: id } }).open()
}

onMounted(() => {
  productFilter.value = null
})

watch(() => selectedOrganizationId.value, async () => {
  productFilter.value = null
})

watch(() => [productFilter.value, selectedOrganizationId.value], async () => {
  await loadStock()
})

</script>
<template>
  <UContainer>
    <div class="flex">
      <h1 class="font-bold text-2xl">Stock</h1>
      <CreateStockMvtBtn
        v-if="selectedOrganization && hasMinimumRole(selectedOrganization.role, 'MANAGER')" 
        class="ml-auto mr-2"
      />
    </div>
    <USeparator class="py-3"/>
    <ProductSelector
      v-model="productFilter"
      class="w-100 max-w-full mb-4"
    />
    <div
      class="gap-2 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 flex flex-col">
      <template
        v-for="movement in stock"
        :key="movement.id">
        <StockMovementItem
          :movement
          @click="() => openStockMovementCard(movement.id)"
        />
      </template>
    </div>
  </UContainer>
</template>
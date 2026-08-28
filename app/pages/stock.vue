<script setup lang="ts">
import StockMovementItem from '~/components/StockMovementItem.vue'

const { stock, loadStock, productFilter } = useStock()
const { selectedOrganizationId } = useOrganization()

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
      <CreateStockMvtBtn class="ml-auto mr-2"/>
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
        <StockMovementItem :movement/>
      </template>
    </div>
  </UContainer>
</template>
<script setup lang="ts">
const { sales, loadSales } = useSales()
const { selectedOrganizationId } = useOrganization()

watch(() => [selectedOrganizationId.value], async () => {
  await loadSales()
})

</script>
<template>
  <UContainer>
    <div class="flex">
      <h1 class="font-bold text-2xl">Sales</h1>
      <CreateSaleBtn class="ml-auto mr-2"/>
    </div>
    <USeparator class="py-3"/>
    <!-- <ProductSelector
      class="w-100 max-w-full mb-4"
    /> -->
    <div
      class="gap-2 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 flex flex-col">
      <template
        v-for="sale in sales"
        :key="sale.id">
        <SaleItem :sale/>
      </template>
    </div>
  </UContainer>
</template>
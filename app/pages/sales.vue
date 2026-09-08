<script setup lang="ts">
import SaleCard from '~/components/Cards/SaleCard.vue'

const { sales, loadSales } = useSales()
const { selectedOrganizationId } = useOrganization()
const overlay = useOverlay()

watch(() => [selectedOrganizationId.value], async () => {
  await loadSales()
})


function openCard (id: string) {
  overlay.create(SaleCard, { props: { saleId: id } }).open()
}

</script>
<template>
  <UContainer>
    <div class="flex">
      <h1 class="font-bold text-2xl">Sales</h1>
      <CreateSaleBtn class="ml-auto mr-2"/>
    </div>
    <USeparator class="py-3"/>
    <div
      class="gap-2 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 flex flex-col">
      <template
        v-for="sale in sales"
        :key="sale.id">
        <SaleItem 
          :sale 
          @click="() => openCard(sale.id)"
        />
      </template>
    </div>
  </UContainer>
</template>
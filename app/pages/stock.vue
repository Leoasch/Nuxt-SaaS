<script setup lang="ts">

const { stock, loadStock } = useStock()
const { selectedOrganizationId } = useOrganization()

watch(() => selectedOrganizationId.value, async () => {
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
    <!-- <div
      :class="`
       gap-2 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 
      ${displayType === 'list' ? 'flex flex-col' : 'grid gap-6'}
    `">
      <template
        v-for="customer in customers"
        :key="customer.id">
        <CustomerItem
          :customer
          :display-type="displayType"
        />
      </template>
    </div> -->
  </UContainer>
</template>
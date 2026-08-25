<script setup lang="ts">
import type { DisplayType } from '~~/shared/types'


const { customers, loadCustomers } = useCustomers()
const { selectedOrganizationId } = useOrganization()

watch(() => selectedOrganizationId.value, async () => {
  await loadCustomers()
})

const displayType = ref<DisplayType>('list')

</script>
<template>
  <UContainer>
    <div class="flex">
      <h1 class="font-bold text-2xl">Customers</h1>
      <CreateCustomerBtn class="ml-auto mr-2"/>
    </div>
    <USeparator class="py-3"/>
    <DisplaySelector
      v-model="displayType"
      class="mb-3 ml-auto"/>
    <div
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
    </div>
  </UContainer>
</template>
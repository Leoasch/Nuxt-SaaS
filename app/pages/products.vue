<script setup lang="ts">
import type { DisplayType } from '~~/shared/types'


const { products, loadProducts } = useProducts()
const { selectedOrganizationId } = useOrganization()

watch(() => selectedOrganizationId.value, async () => {
  await loadProducts()
})

const displayType = ref<DisplayType>('list')

</script>
<template>
  <UContainer>
    <div class="flex">
      <h1 class="font-bold text-2xl">Products</h1>
      <CreateProductBtn class="ml-auto mr-2"/>
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
        v-for="product in products"
        :key="product.id">
        <ProductItem
          :product
          :display-type="displayType"
        />
      </template>
    </div>
  </UContainer>
</template>
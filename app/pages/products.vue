<script setup lang="ts">

const { products, loadProducts } = useProducts()
const { selectedOrganizationId } = useOrganization()

watch(() => selectedOrganizationId.value, async () => {
  await loadProducts()
  console.log((products.value))
  
})

</script>
<template>
  <UContainer>
    <div class="flex">
      <h1 class="font-bold text-2xl">Products</h1>
      <CreateProductBtn class="ml-auto mr-2"/>
    </div>
    <USeparator class="py-3"/>
    <div class="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-6">
      <template
        v-for="product in products"
        :key="product.id">
        <ProductCard :product/>
      </template>
    </div>
  </UContainer>
</template>
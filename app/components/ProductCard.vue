<script setup lang="ts">
import type { Product } from '~~/shared/types'
import ProductForm from './Forms/ProductForm.vue'

const props = defineProps<{
  product: Product
}>()

const overlay = useOverlay()

function editModal () {
  overlay.create(ProductForm, { props: {
    product: props.product, orgId: props.product.organization_id
  } }).open()
}
</script>

<template>
  <UCard
    :ui="{
      header: 'bg-accented-900/80',
      title: 'font-bold',
      body: 'bg-linear-to-r from-accented/30 to-accented/10'
    }"
    variant="soft"
    :title="product.name"
    @click="editModal"
  >
    <h1>{{ product.barcode }}</h1>
  </UCard>
</template>

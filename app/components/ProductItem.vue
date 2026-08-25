<script setup lang="ts">
import type { DisplayType, Product } from '~~/shared/types'
import ProductForm from './Forms/ProductForm.vue'

const props = defineProps<{
  product: Product,
  displayType: DisplayType
}>()

const overlay = useOverlay()

function editModal () {
  overlay.create(ProductForm, { props: {
    product: props.product, orgId: props.product.organization_id
  } }).open()
}

const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const formattedPrice = computed(() => priceFormatter.format(props.product.sale_price))

const isLowStock = computed(() => props.product.stock_quantity <= props.product.minimum_stock)
</script>

<template>
  <div
    class="cursor-pointer rounded border border-accented bg-accented/20 p-2 flex gap-3 hover:bg-accented/40 hover:scale-105 transition-all duration-300"
    :class="displayType === 'grid' ? 'flex-col' : 'w-full items-center'"
    @click="editModal">
    <ImageCarousel
      :images="product.images!"
      :product-id="product.id"
      :org-id="product.organization_id"
      :class="displayType === 'grid' ? 'aspect-square w-full' : 'size-20 shrink-0'"
    />

    <div class="flex min-w-0 flex-1 flex-col justify-center">
      <h1 class="truncate font-bold">{{ product.name }}</h1>
      <p
        v-if="product.sku"
        class="truncate text-xs text-dimmed">SKU: {{ product.sku }}</p>
    </div>

    <div
      class="flex items-center gap-2 mr-2"
      :class="displayType === 'grid' ? 'justify-between' : 'shrink-0'">
      <span class="font-bold">{{ formattedPrice }}</span>
      <UBadge
        :color="isLowStock ? 'error' : 'neutral'"
        variant="subtle"
        icon="lucide:package">
        {{ product.stock_quantity }}
      </UBadge>
    </div>
  </div>
</template>

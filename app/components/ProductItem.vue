<script setup lang="ts">
import type { DisplayType, Product } from '~~/shared/types'

const props = defineProps<{
  product: Product,
  displayType: DisplayType
}>()

const isLowStock = computed(() => props.product.stock_quantity <= props.product.minimum_stock)
</script>

<template>
  <div
    class="cursor-pointer rounded border border-accented bg-accented/20 p-2 flex gap-3 hover:bg-accented/40 hover:scale-102 transition-all duration-300"
    :class="displayType === 'grid' ? 'flex-col' : 'w-full items-center'">
    <ImageCarousel
      :images="product.images!"
      :product-id="product.id"
      :product-name="product.name"
      :org-id="product.organization_id"
      :class="displayType === 'grid' ? 'aspect-square w-full' : 'size-20 shrink-0'"
    />

    <div class="flex min-w-0 flex-1 flex-col justify-center">
      <h1 class="truncate font-bold">{{ product.name }}</h1>
      <p
        v-if="product.sku"
        class="truncate text-xs text-dimmed">{{ $t('product.sku_value', { sku: product.sku }) }}</p>
    </div>

    <div
      class="flex items-center gap-2 mr-2"
      :class="displayType === 'grid' ? 'justify-between' : 'shrink-0'">
      <span class="font-bold">{{ $n(product.sale_price, 'currency') }}</span>
      <UBadge
        :color="isLowStock ? 'error' : 'neutral'"
        variant="subtle"
        icon="lucide:package">
        {{ product.stock_quantity }}
      </UBadge>
    </div>
  </div>
</template>

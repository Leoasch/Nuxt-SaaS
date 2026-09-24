<script setup lang="ts">
import { getStockMV } from '~/api/stockMovements'
import { getProducts } from '~/api/products'
import type { Product, StockMovement } from '~~/shared/types'

const props = defineProps<{
  stockId: string
}>()

const movement = ref<StockMovement | null>(null)
const product = ref<Product | null>(null)
const loading = ref(false)
const { selectedOrganizationId } = useOrganization()

async function onLoad () {
  try {
    loading.value = true
    if (selectedOrganizationId.value) {
      const result = await getStockMV(selectedOrganizationId.value, props.stockId)
      if (result.stockMovement) {
        movement.value = result.stockMovement
        const productResult = await getProducts(selectedOrganizationId.value, result.stockMovement.product_id)
        if (productResult.product) {
          product.value = productResult.product
        }
      }
    }
  } finally {
    loading.value = false
  }
}

const { d } = useI18n()
const { formatReason } = useStockReason()

const isPositiveStock = computed(() => (movement.value?.quantity ?? 0) >= 0)
const formattedDate = computed(() => movement.value?.createdAt ? d(new Date(movement.value.createdAt), 'dateTime') : '')
</script>

<template>
  <CardsBase
    :can-delete="false"
    :can-edit="false"
    :loading
    @load="onLoad"
  >
    <div
      v-if="movement"
      class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <div
          class="flex size-14 shrink-0 items-center justify-center rounded-full"
          :class="isPositiveStock ? 'bg-success-700/10 text-success-500' : 'bg-error-700/10 text-error-500'">
          <UIcon
            :name="isPositiveStock ? 'lucide:arrow-up' : 'lucide:arrow-down'"
            class="size-6"/>
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-lg font-bold">{{ product?.name ?? movement.product_name }}</h1>
          <UBadge
            :color="isPositiveStock ? 'success' : 'error'"
            variant="subtle"
            :icon="isPositiveStock ? 'lucide:arrow-up' : 'lucide:arrow-down'"
            class="mt-1">
            {{ movement.quantity }}
          </UBadge>
        </div>
      </div>

      <div
        v-if="movement.reason"
        class="flex items-start gap-2 rounded border border-accented bg-accented/20 p-2 dark:bg-accented/30">
        <UIcon
          name="lucide:message-square-text"
          class="size-4 shrink-0 mt-0.5 text-dimmed"/>
        <span class="min-w-0 wrap-break-word">{{ formatReason(movement.reason) }}</span>
      </div>

      <span
        v-if="formattedDate"
        class="text-sm text-dimmed">{{ formattedDate }}</span>
    </div>
  </CardsBase>
</template>

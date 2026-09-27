<script setup lang="ts">
import { getLowStockProducts, type LowStockResult } from '~/api/products'
import ProductCard from '~/components/Cards/ProductCard.vue'

const props = defineProps<{
  orgId: string
}>()

const STATUS_STYLES = {
  below: {
    row: 'border-error/40 bg-error/10 hover:bg-error/20',
    icon: 'lucide:circle-alert',
    text: 'text-error',
    color: 'error',
    label: 'dashboard.low_stock.below'
  },
  near: {
    row: 'border-warning/40 bg-warning/10 hover:bg-warning/20',
    icon: 'lucide:triangle-alert',
    text: 'text-warning',
    color: 'warning',
    label: 'dashboard.low_stock.near'
  }
} as const

const overlay = useOverlay()
const loading = ref(false)
const result = ref<LowStockResult | null>(null)

async function load () {
  loading.value = true
  try {
    result.value = await getLowStockProducts(props.orgId)
  } catch {
    result.value = null
  } finally {
    loading.value = false
  }
}

async function openProduct (productId: string) {
  await overlay.create(ProductCard, { props: { productId } }).open().result
  await load()
}

watch(() => props.orgId, load, { immediate: true })
</script>

<template>
  <div class="flex max-h-80 flex-col gap-3 rounded border border-accented bg-accented/20 p-4 dark:bg-accented/30">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm text-dimmed">{{ $t('dashboard.low_stock.title') }}</span>
      <template v-if="result">
        <UBadge
          v-if="result.counts.below"
          color="error"
          variant="subtle"
          icon="lucide:circle-alert">
          {{ $t('dashboard.low_stock.below_count', { count: $n(result.counts.below, 'integer') }) }}
        </UBadge>
        <UBadge
          v-if="result.counts.near"
          color="warning"
          variant="subtle"
          icon="lucide:triangle-alert">
          {{ $t('dashboard.low_stock.near_count', { count: $n(result.counts.near, 'integer') }) }}
        </UBadge>
      </template>
      <UButton
        icon="lucide:refresh-cw"
        color="neutral"
        variant="ghost"
        class="ml-auto cursor-pointer"
        :aria-label="$t('common.refresh')"
        :ui="{
          leadingIcon: 'hover:rotate-90 transition-transform duration-300'
        }"
        @click="load"
      />
    </div>
    <Loadable
      :loading
      class="min-h-0 flex-1 overflow-y-auto p-2">
      <template v-if="result">
        <div
          v-if="result.products.length"
          class="grid gap-2">
          <button
            v-for="product in result.products"
            :key="product.id"
            type="button"
            class="relative flex w-full min-w-0 cursor-pointer items-center gap-3 rounded border p-2 text-left transition-colors"
            :class="STATUS_STYLES[product.status].row"
            @click="openProduct(product.id)">
            <UIcon
              :name="STATUS_STYLES[product.status].icon"
              class="size-5 shrink-0"
              :class="STATUS_STYLES[product.status].text"
            />
            <span class="sr-only">{{ $t(STATUS_STYLES[product.status].label) }}</span>
            <div class="flex min-w-0 flex-1 flex-col">
              <span class="truncate font-bold">{{ product.name }}</span>
              <span
                v-if="product.sku"
                class="truncate text-xs text-dimmed">{{ $t('product.sku_value', { sku: product.sku }) }}</span>
            </div>
            <UBadge
              :color="STATUS_STYLES[product.status].color"
              variant="subtle"
              class="shrink-0">
              {{ $t('dashboard.low_stock.quantity', { stock: $n(product.stock_quantity, 'integer'), minimum: $n(product.minimum_stock, 'integer') }) }}
            </UBadge>
          </button>
        </div>
        <div
          v-else
          class="flex items-center justify-center gap-2 py-4 text-sm text-dimmed">
          <UIcon
            name="lucide:badge-check"
            class="size-5 shrink-0 text-success"/>
          <span>{{ $t('dashboard.low_stock.empty') }}</span>
        </div>
        <p
          v-if="result.total > result.products.length"
          class="mt-2 text-center text-sm text-dimmed">
          {{ $t('dashboard.low_stock.more', { count: result.total - result.products.length }, result.total - result.products.length) }}
        </p>
      </template>
    </Loadable>
  </div>
</template>

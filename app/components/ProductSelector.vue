<script lang="ts" setup>
import { searchProducts } from '~/api/products'
import type { Product } from '~~/shared/types'

const DEBOUNCE_MS = 300

const search_query = ref('')
const product_id = defineModel<string | null>({ default: null })
const { selectedOrganizationId } = useOrganization()

const searchedProducts = ref<Product[]>([])
const loading = ref(false)
const open = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | undefined
let requestId = 0
let suppressSearch = false

async function search () {
  if (!selectedOrganizationId.value) {
    return
  }

  const currentRequest = ++requestId
  loading.value = true

  try {
    const result = await searchProducts(selectedOrganizationId.value, search_query.value)

    if (currentRequest === requestId) {
      searchedProducts.value = result.products
    }
  } finally {
    if (currentRequest === requestId) {
      loading.value = false
    }
  }
}

watch(search_query, (value) => {
  clearTimeout(debounceTimer)

  if (suppressSearch) {
    suppressSearch = false
    return
  }

  if (!value.trim()) {
    searchedProducts.value = []
    loading.value = false
    return
  }

  open.value = true
  debounceTimer = setTimeout(search, DEBOUNCE_MS)
})

function select (product: Product) {
  suppressSearch = true
  product_id.value = product.id
  search_query.value = product.name
  searchedProducts.value = []
  open.value = false
}

onUnmounted(() => clearTimeout(debounceTimer))
</script>

<template>
  <div class="relative w-full">
    <UInput
      v-model="search_query"
      :loading="loading"
      class="w-full"
      @focus="open = searchedProducts.length > 0"
      @blur="open = false"
    />

    <div
      v-if="open"
      class="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded border border-accented bg-default shadow-lg">
      <button
        v-for="product in searchedProducts"
        :key="product.id"
        type="button"
        class="flex w-full min-w-0 cursor-pointer flex-col gap-0.5 p-2 text-left hover:bg-accented/40"
        @mousedown.prevent="select(product)">
        <span class="truncate font-bold">{{ product.name }}</span>

        <span class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-dimmed">
          <span
            v-if="product.sku"
            class="flex min-w-0 items-center gap-1">
            <UIcon
              name="lucide:tag"
              class="size-3.5 shrink-0"/>
            <span class="truncate">{{ product.sku }}</span>
          </span>
          <span
            v-if="product.barcode"
            class="flex min-w-0 items-center gap-1">
            <UIcon
              name="lucide:barcode"
              class="size-3.5 shrink-0"/>
            <span class="truncate">{{ product.barcode }}</span>
          </span>
          <span
            class="flex shrink-0 items-center gap-1"
            :class="product.stock_quantity <= product.minimum_stock ? 'text-error' : ''">
            <UIcon
              name="lucide:package"
              class="size-3.5 shrink-0"/>
            {{ product.stock_quantity }}
          </span>
        </span>
      </button>

      <p
        v-if="!loading && searchedProducts.length === 0"
        class="p-2 text-sm text-dimmed">
        {{ $t('product.search.empty') }}
      </p>
    </div>
  </div>
</template>

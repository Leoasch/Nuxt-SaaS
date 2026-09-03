<script lang="ts" setup>
import { searchProducts } from '~/api/products'
import type { Product } from '~~/shared/types'

const DEBOUNCE_MS = 300
const DEFAULT_LIMIT = 10

const search_query = ref('')
const product_id = defineModel<string | null>({ default: null })
const emit = defineEmits<{ select: [product: Product | null] }>()
const { selectedOrganizationId } = useOrganization()
const { products, loadProducts } = useProducts()

const searchedProducts = ref<Product[]>([])
const selectedProduct = ref<Product | null>(null)
const loading = ref(false)
const open = ref(false)

const displayedProducts = computed(() => search_query.value.trim()
  ? searchedProducts.value
  : products.value.slice(0, DEFAULT_LIMIT))

let debounceTimer: ReturnType<typeof setTimeout> | undefined
let requestId = 0

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

  if (!value.trim()) {
    searchedProducts.value = []
    loading.value = false
    return
  }

  debounceTimer = setTimeout(search, DEBOUNCE_MS)
})

watch(() => selectedOrganizationId.value, async () => {
  selectedProduct.value = null
  searchedProducts.value = []
  await loadProducts()
})

function select (product: Product) {
  product_id.value = product.id
  selectedProduct.value = product
  search_query.value = ''
  searchedProducts.value = []
  open.value = false
  emit('select', product)
}

function clearSelection () {
  product_id.value = null
  selectedProduct.value = null
  emit('select', null)
}

onUnmounted(() => clearTimeout(debounceTimer))
</script>

<template>
  <div class="relative">
    <div
      class="flex h-[58px] w-full min-w-0 items-center gap-3 rounded border border-accented p-2 focus-within:ring-2 focus-within:ring-primary/50">
      <ImageCarousel
        v-if="selectedProduct?.images"
        :org-id="selectedProduct.organization_id"
        :product-id="selectedProduct.id"
        :images="selectedProduct.images"
        class="size-10 shrink-0 border border-accented/50"
      />
      <div
        v-else
        class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-accented/50 text-dimmed">
        <UIcon
          :name="loading ? 'lucide:loader-circle' : 'lucide:search'"
          class="size-4"
          :class="loading ? 'animate-spin' : ''"
        />
      </div>

      <div
        v-if="selectedProduct"
        class="flex min-w-0 flex-1 flex-col">
        <span class="truncate font-bold">{{ selectedProduct.name }}</span>

        <span class="flex min-w-0 items-center gap-x-3 overflow-hidden text-xs text-dimmed">
          <span
            v-if="selectedProduct.sku"
            class="flex min-w-0 items-center gap-1">
            <UIcon
              name="lucide:tag"
              class="size-3.5 shrink-0"/>
            <span class="truncate">{{ selectedProduct.sku }}</span>
          </span>
          <span
            v-if="selectedProduct.barcode"
            class="flex min-w-0 items-center gap-1">
            <UIcon
              name="lucide:barcode"
              class="size-3.5 shrink-0"/>
            <span class="truncate">{{ selectedProduct.barcode }}</span>
          </span>
          <span
            class="flex shrink-0 items-center gap-1"
            :class="selectedProduct.stock_quantity <= selectedProduct.minimum_stock ? 'text-error' : ''">
            <UIcon
              name="lucide:package"
              class="size-3.5 shrink-0"/>
            {{ selectedProduct.stock_quantity }}
          </span>
        </span>
      </div>
      <input
        v-else
        v-model="search_query"
        type="text"
        class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-dimmed"
        :placeholder="$t('product.select.placeholder')"
        @focus="open = true"
        @blur="open = false"
      >

      <UButton
        v-if="selectedProduct"
        icon="lucide:x"
        color="neutral"
        variant="ghost"
        size="sm"
        class="shrink-0 cursor-pointer"
        :aria-label="$t('product.selector.clear')"
        @click="clearSelection"
      />
    </div>

    <div
      v-if="open && !selectedProduct"
      class="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border border-accented bg-default shadow-lg">
      <button
        v-for="product in displayedProducts"
        :key="product.id"
        type="button"
        class="flex w-full min-w-0 cursor-pointer items-center gap-0.5 p-2 text-left hover:bg-accented/40"
        @mousedown.prevent="select(product)">
        <ImageCarousel
          v-if="product.images"
          :org-id="product.organization_id"
          :product-id="product.id"
          :images="product.images"
          class="size-12 shrink-0 border border-accented/50"
        />
        <div class="ml-3 flex min-w-0 flex-col">
          <span class="truncate font-bold">{{ product.name }}</span>

          <span class="flex min-w-0 items-center gap-x-3 overflow-hidden text-xs text-dimmed">
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
        </div>
      </button>

      <p
        v-if="!loading && displayedProducts.length === 0"
        class="p-2 text-sm text-dimmed">
        {{ $t('product.search.empty') }}
      </p>
    </div>
  </div>
</template>

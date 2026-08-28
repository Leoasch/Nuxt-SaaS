<script setup lang="ts">
import { searchProducts } from '~/api/products'
import type { DisplayType, Product } from '~~/shared/types'

const DEBOUNCE_MS = 300

const { products, loadProducts } = useProducts()
const { selectedOrganizationId } = useOrganization()

watch(() => selectedOrganizationId.value, async () => {
  search_query.value = ''
  await loadProducts()
})

const displayType = ref<DisplayType>('list')

const search_query = ref('')
const searchedProducts = ref<Product[]>([])
const searching = ref(false)

const displayedProducts = computed(() => search_query.value.trim()
  ? searchedProducts.value
  : products.value)

let debounceTimer: ReturnType<typeof setTimeout> | undefined
let requestId = 0

async function search () {
  if (!selectedOrganizationId.value) {
    return
  }

  const currentRequest = ++requestId
  searching.value = true

  try {
    const result = await searchProducts(selectedOrganizationId.value, search_query.value)

    if (currentRequest === requestId) {
      searchedProducts.value = result.products
    }
  } finally {
    if (currentRequest === requestId) {
      searching.value = false
    }
  }
}

watch(search_query, (value) => {
  clearTimeout(debounceTimer)

  if (!value.trim()) {
    searchedProducts.value = []
    searching.value = false
    return
  }

  debounceTimer = setTimeout(search, DEBOUNCE_MS)
})

onUnmounted(() => clearTimeout(debounceTimer))
</script>

<template>
  <UContainer class="size-full flex flex-col">
    <div class="flex max-h-full max-w-full">
      <h1 class="font-bold text-2xl">Products</h1>
      <CreateProductBtn class="ml-auto mr-2"/>
    </div>
    <USeparator class="py-3"/>
    <div class="flex gap-2 mb-3">
      <UInput
        v-model="search_query"
        :loading="searching"
        icon="lucide:search"
        :placeholder="$t('product.search.placeholder')"
        class="w-full max-w-sm"
      />
      <DisplaySelector
        v-model="displayType"
        class="ml-auto"/>
    </div>
    <p
      v-if="search_query.trim() && !searching && displayedProducts.length === 0"
      class="text-dimmed text-sm">
      {{ $t('product.search.empty') }}
    </p>
    <div
      v-if="!searching"
      :class="`
       gap-2 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 max-w-full pb-6
      ${displayType === 'list' ? 'flex flex-col' : 'grid gap-6'}
    `">
      <template
        v-for="product in displayedProducts"
        :key="product.id">
        <ProductItem
          :product
          :display-type="displayType"
        />
      </template>
    </div>
    <div
      v-else
      class="w-full flex-1">
      <div class="size-full flex flex-col items-center justify-center">
        <UIcon
          name="lucide:loader-circle"
          class="animate-spin mb-20 size-15"
        />
      </div>
    </div>
  </UContainer>
</template>

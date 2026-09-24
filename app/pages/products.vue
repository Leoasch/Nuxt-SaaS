<script setup lang="ts">
import { searchProducts } from '~/api/products'
import ProductCard from '~/components/Cards/ProductCard.vue'
import type { DisplayType, Product } from '~~/shared/types'

const DEBOUNCE_MS = 300

const { products, loadProducts, paging } = useProducts()
const { selectedOrganizationId, selectedOrganization } = useOrganization()
const overlay = useOverlay()
const loading = ref(false)

async function loadData () {
  try {
    loading.value = true
    if (search_query.value.trim()) {
      await search()
    } else {
      await loadProducts()
    }
  } finally {
    loading.value = false
  }
}

watch(() => [selectedOrganizationId.value], async () => {
  search_query.value = ''
  if (paging.value.index !== 0) {
    paging.value.index = 0
    return
  }

  await loadData()
})

watch(() => paging.value.index, loadData)

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

function openProductCard (id: string) {
  overlay.create(ProductCard, { props: { productId: id } }).open()
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

const initialLoad = callOnce('products', () => loadData().catch(() => {}), { mode: 'navigation' })
if (import.meta.server) {
  await initialLoad
}
</script>

<template>
  <UContainer class="size-full flex flex-col">
    <div class="flex max-h-full max-w-full">
      <h1 class="font-bold text-2xl">{{ $t('nav.products') }}</h1>
      <UButton
        v-if="selectedOrganization"
        icon="lucide:refresh-cw"
        color="neutral"
        variant="ghost"
        class="cursor-pointer ml-3"
        :aria-label="$t('common.refresh')"
        :ui="{
          leadingIcon: 'hover:rotate-90 transition-transform duration-300'
        }"
        @click="loadData"
      />
      <CreateProductBtn
        v-if="selectedOrganization && hasMinimumRole(selectedOrganization.role, 'MANAGER')"
        class="ml-auto mr-2"
      />
    </div>
    <USeparator class="py-3"/>
    <template v-if="!selectedOrganizationId">
      <div class="size-full flex flex-col items-center justify-center mt-5">
        <NoOrganizationIcon class="size-14 mb-2"/>
        <h1 class="text-dimmed">{{ $t('page.no_organization_selected') }}</h1>
      </div>
    </template>
    <template v-else>
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
      <ItemsPaging
        v-model="paging.index"
        :total="paging.count"
        :limit="paging.limit"
        :loading
      >
        <p
          v-if="search_query.trim() && !searching && displayedProducts.length === 0"
          class="text-dimmed text-sm">
          {{ $t('product.search.empty') }}
        </p>
        <p
          v-if="!search_query.trim() && !searching && displayedProducts.length === 0"
          class="text-dimmed text-sm">
          {{ $t('product.no_products') }}
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
              @click="() => openProductCard(product.id)"
            />
          </template>
        </div>
      </ItemsPaging>
    </template>
  </UContainer>
</template>

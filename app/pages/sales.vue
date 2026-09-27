<script setup lang="ts">
import SaleCard from '~/components/Cards/SaleCard.vue'

const { sales, loadSales, paging, filters, summary } = useSales()
const { selectedOrganizationId, selectedOrganization } = useOrganization()
const overlay = useOverlay()
const loading = ref(false)

const hasFilters = computed(() => !!(filters.value.productId || filters.value.from || filters.value.to))

async function loadData () {
  try {
    loading.value = true
    await loadSales()
  } finally {
    loading.value = false
  }
}

filters.value = emptySalesFilters()

watch(() => selectedOrganizationId.value, () => {
  filters.value = emptySalesFilters()
})

watch(() => [selectedOrganizationId.value, filters.value], async () => {
  if (paging.value.index !== 0) {
    paging.value.index = 0
    return
  }

  await loadData()
}, { deep: true })

watch(() => paging.value.index, loadData)

function openCard (id: string) {
  overlay.create(SaleCard, { props: { saleId: id } }).open()
}

const initialLoad = callOnce('sales', () => loadData().catch(() => {}), { mode: 'navigation' })
if (import.meta.server) {
  await initialLoad
}
</script>
<template>
  <UContainer class="size-full flex flex-col">
    <div class="flex">
      <h1 class="font-bold text-2xl">{{ $t('nav.sales') }}</h1>
      <template v-if="selectedOrganization">
        <UButton
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
        <CreateSaleBtn 
          class="ml-auto mr-2"
        />
      </template>
    </div>
    <USeparator class="py-3"/>
    <template v-if="!selectedOrganizationId">
      <div class="size-full flex flex-col items-center justify-center mt-5">
        <NoOrganizationIcon class="size-14 mb-2"/>
        <h1 class="text-dimmed">{{ $t('page.no_organization_selected') }}</h1>
      </div>
    </template>
    <template v-else>
      <div class="mb-3 flex flex-col gap-2 sm:flex-row">
        <ProductSelector
          v-model="filters.productId"
          class="w-100 max-w-full"
        />
        <DateRangePicker
          v-model:from="filters.from"
          v-model:to="filters.to"
          class="w-full sm:w-80"
        />
      </div>
      <p
        v-if="summary?.count"
        class="mb-2 px-4 text-sm text-dimmed">
        <template v-if="filters.productId && summary.quantity !== null">
          {{ $t('sale.filter.summary_product', { count: summary.count, units: $t('sale.filter.units', summary.quantity), total: $n(summary.total, 'currency') }, summary.count) }}
        </template>
        <template v-else>
          {{ $t('sale.filter.summary', { count: summary.count, total: $n(summary.total, 'currency') }, summary.count) }}
        </template>
      </p>
      <ItemsPaging
        v-model="paging.index"
        :total="paging.count"
        :limit="paging.limit"
        :loading
      >
        <p
          v-if="sales.length === 0"
          class="text-dimmed text-sm">
          {{ hasFilters ? $t('sale.filter.empty') : $t('sale.no_sales') }}
        </p>
        <template v-else>
          <div
            class="gap-2 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 flex flex-col">
            <template
              v-for="sale in sales"
              :key="sale.id">
              <SaleItem 
                :sale 
                @click="() => openCard(sale.id)"
              />
            </template>
          </div>
        </template>
      </ItemsPaging>
    </template>
  </UContainer>
</template>
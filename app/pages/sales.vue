<script setup lang="ts">
import SaleCard from '~/components/Cards/SaleCard.vue'

const { sales, loadSales, paging } = useSales()
const { selectedOrganizationId, selectedOrganization } = useOrganization()
const overlay = useOverlay()
const loading = ref(false)

async function loadData () {
  try {
    loading.value = true
    await loadSales()
  } finally {
    loading.value = false
  }
}

watch(() => [selectedOrganizationId.value], async () => {
  if (paging.value.index !== 0) {
    paging.value.index = 0
    return
  }

  await loadData()
})

watch(() => paging.value.index, loadData)

function openCard (id: string) {
  overlay.create(SaleCard, { props: { saleId: id } }).open()
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
      <ItemsPaging
        v-model="paging.index"
        :total="paging.count"
        :limit="paging.limit"
        :loading
      >
        <p
          v-if="sales.length === 0"
          class="text-dimmed text-sm">
          {{ $t('sale.no_sales') }}
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
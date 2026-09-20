<script setup lang="ts">
import StockMovementItem from '~/components/StockMovementItem.vue'
import StockMovementCard from '~/components/Cards/StockMovementCard.vue'

const { stock, loadStock, productFilter, paging } = useStock()
const { selectedOrganizationId, selectedOrganization } = useOrganization()
const overlay = useOverlay()
const loading = ref(false)

async function loadData () {
  try {
    loading.value = true
    await loadStock()
  } finally {
    loading.value = false
  }
}

function openStockMovementCard (id: string) {
  overlay.create(StockMovementCard, { props: { stockId: id } }).open()
}

onMounted(() => {
  productFilter.value = null
})

watch(() => selectedOrganizationId.value, async () => {
  productFilter.value = null
})

watch(() => [productFilter.value, selectedOrganizationId.value], async () => {
  if (paging.value.index !== 0) {
    paging.value.index = 0
    return
  }

  await loadData()
})

watch(() => paging.value.index, loadData)

</script>
<template>
  <UContainer class="size-full flex flex-col">
    <div class="flex">
      <h1 class="font-bold text-2xl">{{ $t('stock') }}</h1>
      <UButton
        v-if="selectedOrganization"
        icon="lucide:refresh-cw"
        color="neutral"
        variant="ghost"
        class="cursor-pointer ml-3"
        :ui="{
          leadingIcon: 'hover:rotate-90 transition-transform duration-300'
        }"
        @click="loadData"
      />
      <CreateStockMvtBtn
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
      <ProductSelector
        v-model="productFilter"
        class="w-100 max-w-full mb-4"
      />
      <ItemsPaging
        v-model="paging.index"
        :total="paging.count"
        :limit="paging.limit"
        :loading
      >
        <p
          v-if="stock.length === 0"
          class="text-dimmed text-sm">
          {{ $t('stock.no_movements') }}
        </p>
        <div
          v-else
          class="gap-2 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 flex flex-col">
          <template
            v-for="movement in stock"
            :key="movement.id">
            <StockMovementItem
              :movement
              @click="() => openStockMovementCard(movement.id)"
            />
          </template>
        </div>
      </ItemsPaging>
    </template>
  </UContainer>
</template>
<script setup lang="ts">
import { searchCustomers } from '~/api/customers'
import CustomerCard from '~/components/Cards/CustomerCard.vue'
import type { Customer, DisplayType } from '~~/shared/types'

const DEBOUNCE_MS = 300

const { customers, loadCustomers, paging } = useCustomers()
const { selectedOrganizationId, selectedOrganization } = useOrganization()
const loading = ref(false)

async function loadData () {
  try {
    loading.value = true
    if (search_query.value.trim()) {
      await search()
    } else {
      await loadCustomers()
    }
  } finally {
    loading.value = false
  }
}

const displayType = ref<DisplayType>('list')

const search_query = ref('')
const searchedCustomers = ref<Customer[]>([])
const searching = ref(false)
const overlay = useOverlay()

const displayedCustomers = computed(() => search_query.value.trim()
  ? searchedCustomers.value
  : customers.value)

let debounceTimer: ReturnType<typeof setTimeout> | undefined
let requestId = 0

async function search () {
  if (!selectedOrganizationId.value) {
    return
  }

  const currentRequest = ++requestId
  searching.value = true

  try {
    const result = await searchCustomers(selectedOrganizationId.value, search_query.value)

    if (currentRequest === requestId) {
      searchedCustomers.value = result.customers
    }
  } finally {
    if (currentRequest === requestId) {
      searching.value = false
    }
  }
}

function openCustomerCard (id: string) {
  overlay.create(CustomerCard, { props: { customerId: id } }).open()
}

watch(search_query, (value) => {
  clearTimeout(debounceTimer)

  if (!value.trim()) {
    searchedCustomers.value = []
    searching.value = false
    return
  }

  debounceTimer = setTimeout(search, DEBOUNCE_MS)
})


watch(() => [selectedOrganizationId.value], async () => {
  search_query.value = ''
  
  if (paging.value.index !== 0) {
    paging.value.index = 0
    return
  }

  await loadData()
})

watch(() => paging.value.index, loadData)

onUnmounted(() => clearTimeout(debounceTimer))
</script>
<template>
  <UContainer class="size-full flex flex-col">
    <div class="flex">
      <h1 class="font-bold text-2xl">{{ $t('nav.customers') }}</h1>
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
      <CreateCustomerBtn
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
          :placeholder="$t('customer.search.placeholder')"
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
        :hide-pagination="!!search_query.trim()"
      >
        <p
          v-if="search_query.trim() && !searching && displayedCustomers.length === 0"
          class="text-dimmed text-sm">
          {{ $t('customer.search.empty') }}
        </p>
        <p
          v-if="!search_query.trim() && !searching && displayedCustomers.length === 0"
          class="text-dimmed text-sm">
          {{ $t('customer.no_customers') }}
        </p>
        <div
          v-if="!searching"
          :class="`
           gap-2 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 max-w-full pb-6
          ${displayType === 'list' ? 'flex flex-col' : 'grid gap-6'}
        `">
          <template
            v-for="customer in displayedCustomers"
            :key="customer.id">
            <CustomerItem
              :customer
              :display-type="displayType"
              @click="() => openCustomerCard(customer.id)"
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
      </ItemsPaging>
    </template>
  </UContainer>
</template>

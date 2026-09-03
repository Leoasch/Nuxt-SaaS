<script lang="ts" setup>
import { searchCustomers } from '~/api/customers'
import type { Customer } from '~~/shared/types'

const DEBOUNCE_MS = 300
const DEFAULT_LIMIT = 10

const search_query = ref('')
const customer_id = defineModel<string | null>({ default: null })
const emit = defineEmits<{ select: [customer: Customer | null] }>()
const { selectedOrganizationId } = useOrganization()
const { customers, loadCustomers } = useCustomers()

const searchedCustomers = ref<Customer[]>([])
const selectedCustomer = ref<Customer | null>(null)
const loading = ref(false)
const open = ref(false)

const displayedCustomers = computed(() => search_query.value.trim()
  ? searchedCustomers.value
  : customers.value.slice(0, DEFAULT_LIMIT))

let debounceTimer: ReturnType<typeof setTimeout> | undefined
let requestId = 0

async function search () {
  if (!selectedOrganizationId.value) {
    return
  }

  const currentRequest = ++requestId
  loading.value = true

  try {
    const result = await searchCustomers(selectedOrganizationId.value, search_query.value)

    if (currentRequest === requestId) {
      searchedCustomers.value = result.customers
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
    searchedCustomers.value = []
    loading.value = false
    return
  }

  debounceTimer = setTimeout(search, DEBOUNCE_MS)
})

watch(() => selectedOrganizationId.value, async () => {
  selectedCustomer.value = null
  searchedCustomers.value = []
  await loadCustomers()
})

function select (customer: Customer) {
  customer_id.value = customer.id
  selectedCustomer.value = customer
  search_query.value = ''
  searchedCustomers.value = []
  open.value = false
  emit('select', customer)
}

function clearSelection () {
  customer_id.value = null
  selectedCustomer.value = null
  emit('select', null)
}

onUnmounted(() => clearTimeout(debounceTimer))
</script>

<template>
  <div class="relative">
    <div
      class="flex h-[58px] w-full min-w-0 items-center gap-3 rounded border border-accented p-2 focus-within:ring-2 focus-within:ring-primary/50">
      <NameInitialsImage
        v-if="selectedCustomer"
        :name="selectedCustomer.name"
        class="size-10"
      />
      <div
        v-else
        class="flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-accented/50 text-dimmed">
        <UIcon
          :name="loading ? 'lucide:loader-circle' : 'lucide:search'"
          class="size-4"
          :class="loading ? 'animate-spin' : ''"
        />
      </div>

      <div
        v-if="selectedCustomer"
        class="flex min-w-0 flex-1 flex-col">
        <span class="truncate font-bold">{{ selectedCustomer.name }}</span>

        <span class="flex min-w-0 items-center gap-x-3 overflow-hidden text-xs text-dimmed">
          <span
            v-if="selectedCustomer.email"
            class="flex min-w-0 items-center gap-1">
            <UIcon
              name="lucide:mail"
              class="size-3.5 shrink-0"/>
            <span class="truncate">{{ selectedCustomer.email }}</span>
          </span>
          <span
            v-if="selectedCustomer.phone"
            class="flex shrink-0 items-center gap-1">
            <UIcon
              name="lucide:phone"
              class="size-3.5 shrink-0"/>
            {{ selectedCustomer.phone }}
          </span>
          <span
            v-if="selectedCustomer.document"
            class="flex shrink-0 items-center gap-1">
            <UIcon
              name="lucide:id-card"
              class="size-3.5 shrink-0"/>
            {{ selectedCustomer.document }}
          </span>
        </span>
      </div>
      <input
        v-else
        v-model="search_query"
        type="text"
        class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-dimmed"
        :placeholder="$t('customer.select.placeholder')"
        @focus="open = true"
        @blur="open = false"
      >

      <UButton
        v-if="selectedCustomer"
        icon="lucide:x"
        color="neutral"
        variant="ghost"
        size="sm"
        class="shrink-0 cursor-pointer"
        :aria-label="$t('customer.selector.clear')"
        @click="clearSelection"
      />
    </div>

    <div
      v-if="open && !selectedCustomer"
      class="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border border-accented bg-default shadow-lg">
      <button
        v-for="customer in displayedCustomers"
        :key="customer.id"
        type="button"
        class="flex w-full min-w-0 cursor-pointer items-center gap-0.5 p-2 text-left hover:bg-accented/40"
        @mousedown.prevent="select(customer)">
        <NameInitialsImage
          :name="customer.name"
          class="size-10 shrink-0"
        />
        <div class="ml-3 flex min-w-0 flex-col">
          <span class="truncate font-bold">{{ customer.name }}</span>

          <span class="flex min-w-0 items-center gap-x-3 overflow-hidden text-xs text-dimmed">
            <span
              v-if="customer.email"
              class="flex min-w-0 items-center gap-1">
              <UIcon
                name="lucide:mail"
                class="size-3.5 shrink-0"/>
              <span class="truncate">{{ customer.email }}</span>
            </span>
            <span
              v-if="customer.phone"
              class="flex shrink-0 items-center gap-1">
              <UIcon
                name="lucide:phone"
                class="size-3.5 shrink-0"/>
              {{ customer.phone }}
            </span>
            <span
              v-if="customer.document"
              class="flex shrink-0 items-center gap-1">
              <UIcon
                name="lucide:id-card"
                class="size-3.5 shrink-0"/>
              {{ customer.document }}
            </span>
          </span>
        </div>
      </button>

      <p
        v-if="!loading && displayedCustomers.length === 0"
        class="p-2 text-sm text-dimmed">
        {{ $t('customer.search.empty') }}
      </p>
    </div>
  </div>
</template>

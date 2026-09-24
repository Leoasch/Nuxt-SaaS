<script setup lang="ts">
import { getSalesSummary, type SalesSummary } from '~/api/sales'

const props = defineProps<{
  orgId: string
}>()

const loading = ref(false)
const summary = ref<SalesSummary | null>(null)

async function load () {
  loading.value = true
  try {
    summary.value = await getSalesSummary(props.orgId)
  } finally {
    loading.value = false
  }
}

watch(() => props.orgId, load, { immediate: true })

const { n } = useI18n()

const tiles = computed(() => [
  {
    key: 'revenue',
    icon: 'lucide:banknote',
    label: 'dashboard.kpi_revenue',
    value: n(summary.value?.totalRevenue ?? 0, 'currency')
  },
  {
    key: 'sales',
    icon: 'lucide:shopping-cart',
    label: 'dashboard.kpi_sales',
    value: n(summary.value?.salesCount ?? 0, 'integer')
  },
  {
    key: 'avg',
    icon: 'lucide:receipt',
    label: 'dashboard.kpi_avg_order_value',
    value: n(summary.value?.avgOrderValue ?? 0, 'currency')
  },
  {
    key: 'customers',
    icon: 'lucide:users',
    label: 'dashboard.kpi_active_customers',
    value: n(summary.value?.activeCustomers ?? 0, 'integer')
  }
])
</script>

<template>
  <Loadable :loading>
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="tile in tiles"
        :key="tile.key"
        class="flex items-center gap-3 rounded border border-accented bg-accented/20 p-4 dark:bg-accented/30">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UIcon
            :name="tile.icon"
            class="size-5"
          />
        </div>
        <div class="flex min-w-0 flex-col">
          <span class="truncate text-xs text-dimmed">{{ $t(tile.label) }}</span>
          <span class="truncate text-lg font-bold">{{ tile.value }}</span>
        </div>
      </div>
    </div>
  </Loadable>
</template>

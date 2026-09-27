<script setup lang="ts">
import { Chart, type ChartData, type ChartOptions, type Plugin } from 'chart.js'
import { Bar } from 'vue-chartjs'
import { getTopProducts, type TopProductsResult } from '~/api/sales'

const props = defineProps<{
  orgId: string
}>()

const PERIODS = [
  { days: 1 as const, label: 'dashboard.period_1d' },
  { days: 7 as const, label: 'dashboard.period_7d' },
  { days: 30 as const, label: 'dashboard.period_30d' }
]

const BAR_COLOR = '#16a34a'
const BAR_HOVER_COLOR = '#15803d'
const MAX_LABEL_LENGTH = 18

const { t, n } = useI18n()
const colorMode = useColorMode()

const loading = ref(false)
const products = ref<TopProductsResult['byQuantity'] | null>(null)
const selectedDays = ref<1 | 7 | 30>(30)

async function load () {
  loading.value = true
  try {
    products.value = (await getTopProducts(props.orgId, selectedDays.value)).byQuantity
  } catch {
    products.value = null
  } finally {
    loading.value = false
  }
}

watch([() => props.orgId, selectedDays], load, { immediate: true })

const isDark = computed(() => colorMode.value === 'dark')
const textColor = computed(() => isDark.value ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)')
const valueColor = computed(() => isDark.value ? '#c3c2b7' : '#52514e')

function truncate (name: string) {
  return name.length > MAX_LABEL_LENGTH ? `${name.slice(0, MAX_LABEL_LENGTH - 1)}…` : name
}

const valueLabels: Plugin<'bar'> = {
  id: 'valueLabels',
  afterDatasetsDraw (chart) {
    const { ctx } = chart
    const values = chart.data.datasets[0]?.data ?? []

    ctx.save()
    ctx.fillStyle = valueColor.value
    ctx.font = `600 11px ${Chart.defaults.font.family}`
    ctx.textBaseline = 'middle'
    chart.getDatasetMeta(0).data.forEach((bar, index) => {
      ctx.fillText(n(Number(values[index] ?? 0), 'integer'), bar.x + 6, bar.y)
    })
    ctx.restore()
  }
}

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: (products.value ?? []).map(product => truncate(product.name)),
  datasets: [
    {
      data: (products.value ?? []).map(product => product.quantity),
      backgroundColor: BAR_COLOR,
      hoverBackgroundColor: BAR_HOVER_COLOR,
      borderRadius: 4,
      maxBarThickness: 24
    }
  ]
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false, axis: 'y' },
  layout: { padding: { right: 40 } },
  scales: {
    x: { display: false, beginAtZero: true },
    y: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: textColor.value, font: { size: 11 } }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: items => products.value?.[items[0]?.dataIndex ?? -1]?.name ?? '',
        label: (ctx) => {
          const product = products.value?.[ctx.dataIndex]
          if (!product) {
            return ''
          }
          const units = t('dashboard.top_selling.units', { count: n(product.quantity, 'integer') }, product.quantity)
          return `${units} · ${n(product.revenue, 'currency')}`
        }
      }
    }
  }
}))
</script>

<template>
  <div class="flex flex-col gap-3 rounded border border-accented bg-accented/20 p-4 dark:bg-accented/30">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="min-w-0 truncate text-sm text-dimmed">{{ $t('dashboard.top_selling.title') }}</span>
      <div class="flex flex-wrap gap-1">
        <UButton
          v-for="period in PERIODS"
          :key="period.days"
          size="xs"
          :color="selectedDays === period.days ? 'primary' : 'neutral'"
          :variant="selectedDays === period.days ? 'outline' : 'subtle'"
          class="cursor-pointer"
          @click="selectedDays = period.days"
        >
          {{ $t(period.label) }}
        </UButton>
      </div>
    </div>
    <Loadable
      :loading="loading && !products"
      class="min-h-0 flex-1">
      <div
        v-if="products?.length"
        class="relative h-full transition-opacity"
        :class="loading ? 'opacity-50' : ''">
        <Bar
          :data="chartData"
          :options="chartOptions"
          :plugins="[valueLabels]"
        />
      </div>
      <div
        v-else-if="products"
        class="flex h-full items-center justify-center text-center text-sm text-dimmed">
        {{ $t('dashboard.top_selling.empty') }}
      </div>
    </Loadable>
  </div>
</template>

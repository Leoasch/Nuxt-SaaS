<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import { Line } from 'vue-chartjs'
import { getRevenue } from '~/api/sales'

const props = defineProps<{
  orgId: string
}>()

const LINE_COLOR = '#16a34a'

const PERIODS = [
  { days: 1 as const, label: 'dashboard.period_1d', heading: 'dashboard.revenue_last_1_day' },
  { days: 7 as const, label: 'dashboard.period_7d', heading: 'dashboard.revenue_last_7_days' },
  { days: 30 as const, label: 'dashboard.period_30d', heading: 'dashboard.revenue_last_30_days' }
]

const loading = ref(false)
const revenue = ref<{ date: string, total: number, count: number }[]>([])
const selectedDays = ref<1 | 7 | 30>(30)
const colorMode = useColorMode()

const heading = computed(() => PERIODS.find(p => p.days === selectedDays.value)?.heading ?? '')

async function load () {
  loading.value = true
  try {
    const result = await getRevenue(props.orgId, selectedDays.value)
    revenue.value = result.revenue
  } finally {
    loading.value = false
  }
}

watch([() => props.orgId, selectedDays], load, { immediate: true })

const { t, n, d } = useI18n()
const labelFormat = computed(() => selectedDays.value === 1 ? 'time' : 'dayMonth')

const total = computed(() => revenue.value.reduce((sum, day) => sum + day.total, 0))

const isDark = computed(() => colorMode.value === 'dark')
const gridColor = computed(() => isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
const textColor = computed(() => isDark.value ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)')
const surfaceColor = computed(() => isDark.value ? '#1a1a19' : '#fcfcfb')

const pointRadius = computed(() => revenue.value.length <= 7 ? 3 : 0)

const chartData = computed<ChartData<'line'>>(() => ({
  labels: revenue.value.map(day => d(new Date(day.date), labelFormat.value)),
  datasets: [
    {
      data: revenue.value.map(day => day.total),
      borderColor: LINE_COLOR,
      backgroundColor: `${LINE_COLOR}1f`,
      fill: true,
      borderWidth: 2,
      tension: 0.25,
      pointRadius: pointRadius.value,
      pointBackgroundColor: LINE_COLOR,
      pointBorderColor: surfaceColor.value,
      pointBorderWidth: 2,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: LINE_COLOR,
      pointHoverBorderColor: surfaceColor.value,
      pointHoverBorderWidth: 2
    }
  ]
}))

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: textColor.value, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }
    },
    y: {
      grid: { color: gridColor.value },
      border: { display: false },
      ticks: {
        color: textColor.value,
        callback: value => n(Number(value ?? 0), 'currency')
      }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => n(ctx.parsed.y ?? 0, 'currency'),
        footer: (items) => {
          const count = revenue.value[items[0]?.dataIndex ?? -1]?.count ?? 0
          return t('dashboard.sales_count', count)
        }
      }
    }
  }
}))
</script>

<template>
  <div class="flex flex-col gap-1 rounded border border-accented bg-accented/20 p-4 dark:bg-accented/30">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span class="min-w-0 truncate text-sm text-dimmed">{{ $t(heading) }}</span>
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
    <div class=flex>
      <span class="text-2xl font-bold">{{ $n(total, 'currency') }}</span>
      <UButton
        icon="lucide:refresh-cw"
        color="neutral"
        variant="ghost"
        class="cursor-pointer ml-2"
        :aria-label="$t('common.refresh')"
        :ui="{
          leadingIcon: 'hover:rotate-90 transition-transform duration-300'
        }"
        @click="load"
      />
    </div>
    <div class="mt-2 h-40">
      <Loadable :loading>
        <Line
          :data="chartData"
          :options="chartOptions"
        />
      </Loadable>
    </div>
  </div>
</template>

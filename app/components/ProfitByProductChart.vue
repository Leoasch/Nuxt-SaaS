<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { getTopProducts, type TopProductsResult } from '~/api/sales'

const props = defineProps<{
  orgId: string
}>()

const PERIODS = [
  { days: 1 as const, label: 'dashboard.period_1d' },
  { days: 7 as const, label: 'dashboard.period_7d' },
  { days: 30 as const, label: 'dashboard.period_30d' }
]

const SLICE_COLORS = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181']
}
const OTHERS_COLOR = { light: '#c3c2b7', dark: '#52514e' }
const SURFACE_COLOR = { light: '#fcfcfb', dark: '#1a1a19' }

const { t, n } = useI18n()
const colorMode = useColorMode()

const loading = ref(false)
const profit = ref<TopProductsResult['byProfit'] | null>(null)
const selectedDays = ref<1 | 7 | 30>(30)
const activeIndex = ref<number | null>(null)

async function load () {
  loading.value = true
  try {
    profit.value = (await getTopProducts(props.orgId, selectedDays.value)).byProfit
  } catch {
    profit.value = null
  } finally {
    loading.value = false
  }
}

watch([() => props.orgId, selectedDays], load, { immediate: true })

const mode = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

const slices = computed(() => {
  if (!profit.value) {
    return []
  }

  const list = profit.value.items.map((item, index) => ({
    key: item.id,
    name: item.name,
    value: item.profit,
    color: SLICE_COLORS[mode.value][index]!
  }))

  if (profit.value.others > 0) {
    list.push({
      key: 'others',
      name: t('dashboard.profit_by_product.others'),
      value: profit.value.others,
      color: OTHERS_COLOR[mode.value]
    })
  }

  return list
})

function share (value: number) {
  return profit.value?.total ? value / profit.value.total : 0
}

const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: slices.value.map(slice => slice.name),
  datasets: [
    {
      data: slices.value.map(slice => slice.value),
      backgroundColor: slices.value.map(slice => slice.color),
      borderColor: SURFACE_COLOR[mode.value],
      hoverBorderColor: SURFACE_COLOR[mode.value],
      borderWidth: 2,
      hoverOffset: 4
    }
  ]
}))

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  layout: { padding: 4 },
  onHover: (_event, elements) => {
    activeIndex.value = elements[0]?.index ?? null
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: () => '',
        label: ctx => `${n(ctx.parsed, 'currency')} · ${n(share(ctx.parsed), 'percent')}`
      }
    }
  }
}))
</script>

<template>
  <div class="flex flex-col gap-3 rounded border border-accented bg-accented/20 p-4 dark:bg-accented/30">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="min-w-0 truncate text-sm text-dimmed">{{ $t('dashboard.profit_by_product.title') }}</span>
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
      :loading="loading && !profit"
      class="min-h-0 flex-1">
      <div
        v-if="profit && slices.length"
        class="flex h-full items-center gap-4 transition-opacity"
        :class="loading ? 'opacity-50' : ''">
        <div class="relative size-36 shrink-0">
          <Doughnut
            :data="chartData"
            :options="chartOptions"
          />
          <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-xs text-dimmed">{{ $t('dashboard.profit_by_product.total') }}</span>
            <span class="text-sm font-bold">{{ $n(profit.total, 'compactCurrency') }}</span>
          </div>
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <ul class="flex min-w-0 flex-col gap-1.5">
            <li
              v-for="(slice, index) in slices"
              :key="slice.key"
              class="-mx-1 flex min-w-0 items-start gap-2 rounded px-1 transition-colors"
              :class="activeIndex === index ? 'bg-accented/60' : ''">
              <span
                class="mt-1 size-2.5 shrink-0 rounded-sm"
                :style="{ backgroundColor: slice.color }"/>
              <div class="flex min-w-0 flex-col">
                <span class="truncate text-xs">{{ slice.name }}</span>
                <span class="text-xs text-dimmed">{{ $n(slice.value, 'currency') }} · {{ $n(share(slice.value), 'percent') }}</span>
              </div>
            </li>
          </ul>
          <p
            v-if="profit.lossCount"
            class="text-xs text-dimmed">
            {{ $t('dashboard.profit_by_product.losses', { count: profit.lossCount }, profit.lossCount) }}
          </p>
        </div>
      </div>
      <div
        v-else-if="profit"
        class="flex h-full items-center justify-center text-center text-sm text-dimmed">
        {{ $t('dashboard.profit_by_product.empty') }}
      </div>
    </Loadable>
  </div>
</template>

<script setup lang="ts">
import { type CalendarDate, type DateValue, getLocalTimeZone, parseDate, today } from '@internationalized/date'

type Range = { start: DateValue | undefined, end: DateValue | undefined }

const WIDE_QUERY = '(min-width: 640px)'

const PRESETS = [
  { key: 'today', start: (day: CalendarDate) => day },
  { key: 'last_7_days', start: (day: CalendarDate) => day.subtract({ days: 6 }) },
  { key: 'last_30_days', start: (day: CalendarDate) => day.subtract({ days: 29 }) },
  { key: 'this_month', start: (day: CalendarDate) => day.set({ day: 1 }) }
] as const

const from = defineModel<string | null>('from', { default: null })
const to = defineModel<string | null>('to', { default: null })

const { d } = useI18n()

const open = ref(false)
const monthCount = ref(1)
const calendarValue = shallowRef<Range>({ start: undefined, end: undefined })
const placeholder = shallowRef<DateValue>()
const maxDate = shallowRef<CalendarDate>()

const hasRange = computed(() => !!from.value && !!to.value)

const label = computed(() => {
  if (!from.value || !to.value) {
    return ''
  }

  const timeZone = getLocalTimeZone()
  const start = d(parseDate(from.value).toDate(timeZone), 'date')

  return from.value === to.value
    ? start
    : `${start} – ${d(parseDate(to.value).toDate(timeZone), 'date')}`
})

const presets = computed(() => {
  const currentDay = maxDate.value ?? today(getLocalTimeZone())

  return PRESETS.map((preset) => {
    const start = preset.start(currentDay)
    return {
      key: preset.key,
      start,
      end: currentDay,
      active: from.value === start.toString() && to.value === currentDay.toString()
    }
  })
})

function apply (start: DateValue, end: DateValue) {
  from.value = start.toString()
  to.value = end.toString()
  open.value = false
}

function onCalendarUpdate (value: Range | null | undefined) {
  calendarValue.value = value ?? { start: undefined, end: undefined }
  if (value?.start && value.end) {
    apply(value.start, value.end)
  }
}

function clear () {
  from.value = null
  to.value = null
}

watch(open, (isOpen) => {
  if (!isOpen) {
    return
  }

  maxDate.value = today(getLocalTimeZone())

  const start = from.value ? parseDate(from.value) : undefined
  const end = to.value ? parseDate(to.value) : undefined

  calendarValue.value = { start, end }
  placeholder.value = (end ?? maxDate.value).subtract({ months: monthCount.value - 1 })
})

let wideQuery: MediaQueryList | undefined

function updateMonthCount () {
  monthCount.value = wideQuery?.matches ? 2 : 1
}

onMounted(() => {
  wideQuery = window.matchMedia(WIDE_QUERY)
  updateMonthCount()
  wideQuery.addEventListener('change', updateMonthCount)
})

onUnmounted(() => wideQuery?.removeEventListener('change', updateMonthCount))
</script>

<template>
  <div
    class="flex h-14.5 min-w-0 items-center gap-1 rounded border border-accented p-2 focus-within:ring-2 focus-within:ring-primary/50">
    <UPopover
      v-model:open="open"
      :content="{ align: 'start' }"
      class="min-w-0 flex-1">
      <button
        type="button"
        class="flex min-w-0 cursor-pointer items-center gap-3 text-left outline-none">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-accented/50"
          :class="hasRange ? 'text-primary' : 'text-dimmed'">
          <UIcon
            name="lucide:calendar"
            class="size-4"/>
        </div>
        <div class="flex min-w-0 flex-col">
          <span class="text-xs text-dimmed">{{ $t('sale.filter.period') }}</span>
          <span
            v-if="hasRange"
            class="truncate text-sm font-bold">{{ label }}</span>
          <span
            v-else
            class="truncate text-sm text-dimmed">{{ $t('sale.filter.any_date') }}</span>
        </div>
      </button>

      <template #content>
        <div class="flex flex-col sm:flex-row">
          <div class="flex flex-wrap gap-1 border-b border-accented p-2 sm:flex-col sm:border-r sm:border-b-0">
            <UButton
              v-for="preset in presets"
              :key="preset.key"
              size="sm"
              :color="preset.active ? 'primary' : 'neutral'"
              :variant="preset.active ? 'soft' : 'ghost'"
              class="cursor-pointer"
              @click="apply(preset.start, preset.end)"
            >
              {{ $t(`sale.filter.presets.${preset.key}`) }}
            </UButton>
          </div>
          <UCalendar
            v-model:placeholder="placeholder"
            :model-value="calendarValue"
            range
            :number-of-months="monthCount"
            :max-value="maxDate"
            class="p-2"
            @update:model-value="onCalendarUpdate"
          />
        </div>
      </template>
    </UPopover>

    <UButton
      v-if="hasRange"
      icon="lucide:x"
      color="neutral"
      variant="ghost"
      size="sm"
      class="shrink-0 cursor-pointer"
      :aria-label="$t('sale.filter.clear_period')"
      @click="clear"
    />
  </div>
</template>

import type { H3Event } from 'h3'

export const SALES_PERIOD_DAYS = [1, 7, 30] as const
export type SalesPeriodDays = typeof SALES_PERIOD_DAYS[number]
export const HOURS_IN_DAY = 24

const DEFAULT_DAYS: SalesPeriodDays = 30

export function getSalesPeriodDays (event: H3Event): SalesPeriodDays {
  const requested = Number(getQuery(event).days)
  return SALES_PERIOD_DAYS.find(days => days === requested) ?? DEFAULT_DAYS
}

export function salesPeriodStart (days: SalesPeriodDays) {
  const start = new Date()

  if (days === 1) {
    start.setMinutes(0, 0, 0)
    start.setHours(start.getHours() - (HOURS_IN_DAY - 1))
    return start
  }

  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))
  return start
}

import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { getSales, type SalesFilter, type SalesListSummary } from '~/api/sales'
import type { Sale } from '~~/shared/types'

export type SalesFilters = {
  productId: string | null
  from: string | null
  to: string | null
}

export const emptySalesFilters = (): SalesFilters => ({ productId: null, from: null, to: null })

function toQuery (filters: SalesFilters): SalesFilter {
  const timeZone = getLocalTimeZone()

  return {
    product_id: filters.productId ?? undefined,
    from: filters.from ? parseDate(filters.from).toDate(timeZone).toISOString() : undefined,
    to: filters.to ? parseDate(filters.to).add({ days: 1 }).toDate(timeZone).toISOString() : undefined
  }
}

export default function () {

  const sales = useState<Sale[]>('sales', () => [])
  const filters = useState<SalesFilters>('salesFilters', emptySalesFilters)
  const summary = useState<SalesListSummary | null>('salesSummary', () => null)

  const paging = useState('salesPaging', () => ({
    index: 0,
    limit: 25,
    count: 0,
    pages: 0
  }))

  async function loadSales () {
    const { selectedOrganizationId } = useOrganization()

    if (selectedOrganizationId.value) {
      const { index, limit } = paging.value
      const result = await getSales(selectedOrganizationId.value, { index, limit, ...toQuery(filters.value) })

      if (result?.sales) {
        sales.value = result.sales
      }

      if (result?.page) {
        paging.value = result.page
      }

      summary.value = result?.summary ?? null

      return
    }
    sales.value = []
    summary.value = null
  }

  return { sales, loadSales, paging, filters, summary }
}

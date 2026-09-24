import { getSales } from '~/api/sales'
import type { Sale } from '~~/shared/types'

export default function () {
  
  const sales = useState<Sale[]>('sales', () => [])

  const paging = useState('salesPaging', () => ({
    index: 0,
    limit: 25,
    count: 0,
    pages: 0
  }))

  async function loadSales () {
    const { selectedOrganizationId } = useOrganization()

    if (selectedOrganizationId.value) {
      
      const result = await getSales(selectedOrganizationId.value, paging.value)

      if (result?.sales) {
        sales.value = result.sales
      }
      
      if (result?.page) {
        paging.value = result.page
      }
      
      return
    }
    sales.value = []
  }

  return { sales, loadSales, paging }
}
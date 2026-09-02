import { getSales } from '~/api/sales'
import type { Sale } from '~~/shared/types'

export default function () {
  
  const sales = useState<Sale[]>('sales', () => [])

  async function loadSales () {
    const { selectedOrganizationId } = useOrganization()

    if (selectedOrganizationId.value) {
      
      const result = await getSales(selectedOrganizationId.value)

      if (result?.sales) {
        sales.value = result.sales
      }
      
      return
    }
    sales.value = []
  }

  loadSales()

  return { sales, loadSales }
}
import { getStockMV } from '~/api/stockMovements'
import type { StockMovement } from '~~/shared/types'

export default function () {
  
  const stock = useState<StockMovement[]>('stock', () => [])
  
  async function loadStock () {
    const { selectedOrganizationId } = useOrganization()

    if (selectedOrganizationId.value) {
      const result = await getStockMV(selectedOrganizationId.value)

      if (result?.stockMovements) {
        stock.value = result.stockMovements
      }
      
      return
    }
    stock.value = []
  }

  loadStock()

  return { stock, loadStock }
}
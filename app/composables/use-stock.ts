import { getProductStockMV, getStockMV } from '~/api/stockMovements'
import type { StockMovement } from '~~/shared/types'

export default function () {
  
  const stock = useState<StockMovement[]>('stock', () => [])
  const productFilter = useState<string | null>('productFilter', () => null)

  async function loadStock () {
    const { selectedOrganizationId } = useOrganization()

    if (selectedOrganizationId.value) {
      
      const result = productFilter.value ?
        await getProductStockMV(selectedOrganizationId.value, productFilter.value) :
        await getStockMV(selectedOrganizationId.value)


      if (result?.stockMovements) {
        stock.value = result.stockMovements
      }
      
      return
    }
    stock.value = []
  }

  loadStock()

  return { stock, loadStock, productFilter }
}
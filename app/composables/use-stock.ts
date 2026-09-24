import { getProductStockMV, getStockMV } from '~/api/stockMovements'
import type { PagingMetadata, StockMovement } from '~~/shared/types'

export default function () {

  const stock = useState<StockMovement[]>('stock', () => [])
  const productFilter = useState<string | null>('productFilter', () => null)

  const paging = useState<PagingMetadata>('stockPaging', () => ({
    index: 0,
    limit: 25,
    count: 0,
    pages: 0
  }))

  async function loadStock () {
    const { selectedOrganizationId } = useOrganization()

    if (selectedOrganizationId.value) {
      const { index, limit } = paging.value

      const result = productFilter.value ?
        await getProductStockMV(selectedOrganizationId.value, productFilter.value, { index, limit }) :
        await getStockMV(selectedOrganizationId.value, { index, limit })


      if (result?.stockMovements) {
        stock.value = result.stockMovements
      }

      if (result?.page) {
        paging.value = result.page
      }

      return
    }
    stock.value = []
  }

  return { stock, loadStock, productFilter, paging }
}
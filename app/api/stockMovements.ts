import type { PagingMetadata, QueryPageParams, StockMovement } from '~~/shared/types'
import { apiRequest, orgRoute } from '.'

export type StockMVBody = {
  quantity: number
  reason: string
  product_id?: string | null
}

type StockMVPage = { stockMovements: StockMovement[], page: PagingMetadata }

export async function getStockMV(org_id: string, params: QueryPageParams): Promise<StockMVPage>
export async function getStockMV(org_id: string, id: string): Promise<{ stockMovement: StockMovement }>
export async function getStockMV (org_id: string, idOrParams: string | QueryPageParams) {
  if (typeof idOrParams === 'string') {
    return await apiRequest<{ stockMovement: StockMovement }>(orgRoute(org_id) + `/stock/${idOrParams}`)
  }
  return await apiRequest<StockMVPage>(orgRoute(org_id) + '/stock', {
    query: idOrParams
  })
}

export async function getProductStockMV (org_id: string, product_id: string, params?: QueryPageParams) {
  return await apiRequest<StockMVPage>(orgRoute(org_id) + '/stock', {
    query: { product_id, ...params }
  })
}

export async function postStockMV (org_id: string, body: StockMVBody) {
  const { product_id, ...rest } = body
  return await apiRequest<{ stockMovement: StockMovement }>(orgRoute(org_id) + '/stock', {
    method: 'POST',
    body: rest,
    query: { product_id }
  })
}
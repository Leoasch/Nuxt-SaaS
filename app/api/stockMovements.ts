import type { StockMovement } from '~~/shared/types'
import { apiRequest, orgRoute } from '.'

export type StockMVBody = {
  quantity: number
  reason: string
  product_id?: string | null
}

export async function getStockMV(org_id: string): Promise<{ stockMovements: StockMovement[] }>
export async function getStockMV(org_id: string, id: string): Promise<{ stockMovement: StockMovement }>
export async function getStockMV (org_id: string, id?: string) {
  if (!id) {
    return await apiRequest<{ stockMovements: StockMovement[] }>(orgRoute(org_id) + '/stock')
  }
  return await apiRequest<{ stockMovement: StockMovement }>(orgRoute(org_id) + `/stock/${id}`)
}

export async function postStockMV (org_id: string, body: StockMVBody) {
  const { product_id, ...rest } = body
  return await apiRequest<{ stockMovement: StockMovement }>(`/api${orgRoute(org_id)}/stock`, {
    method: 'POST',
    body: rest,
    query: { product_id }
  })
}
import type { Sale } from '~~/shared/types'
import { apiRequest, orgRoute } from '.'

export type SaleLineBody = {
  product_id: string
  quantity: number
  unit_price?: number
}

export type SaleBody = {
  customer_id?: string | null
  payment_method: string
  products: SaleLineBody[]
}

export async function getSales(org_id: string): Promise<{ sales: Sale[] }>
export async function getSales(org_id: string, id: string): Promise<{ sales: Sale }>
export async function getSales (org_id: string, id?: string) {

  if (!id) {
    return await apiRequest<{ sales: Sale[] }>(orgRoute(org_id) + '/sales')
  }
  return await apiRequest<{ sales: Sale }>(orgRoute(org_id) + `/sales/${id}`)
}

export async function searchSales (org_id: string, query: string) {
  return await apiRequest<{ sales: Sale[] }>(orgRoute(org_id) + '/sales/search', {
    query: { q: query }
  })
}

export async function postSale (org_id: string, body: SaleBody) {
  return await apiRequest<{ sale: Sale }>(orgRoute(org_id) + '/sales', {
    body,
    method: 'POST'
  })
}

export async function editSale (org_id: string, body: Partial<SaleBody> & { id: string }) {
  const { id, ...rest } = body
  return await apiRequest<{ sale: Sale }>(orgRoute(org_id) + `/sales/${id}`, {
    body: rest,
    method: 'PUT'
  })
}

export async function deleteSale (org_id: string, id: string) {
  return await apiRequest<{ sale: Sale }>(orgRoute(org_id) + `/sales/${id}`, { method: 'DELETE' })
}

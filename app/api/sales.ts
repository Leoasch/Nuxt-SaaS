import type { PagingMetadata, QueryPageParams, Sale } from '~~/shared/types'
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


export async function getSales(org_id: string, params: QueryPageParams): Promise<{ sales: Sale[], page: PagingMetadata }>
export async function getSales(org_id: string, id: string): Promise<{ sale: Sale }>
export async function getSales (org_id: string, idOrParams: string | QueryPageParams) {
  if (typeof idOrParams === 'string') {
    return await apiRequest<{ sale: Sale }>(orgRoute(org_id) + `/sales/${idOrParams}`)
  }
  return await apiRequest<{ sales: Sale[], page: PagingMetadata }>(orgRoute(org_id) + '/sales', {
    query: idOrParams
  })
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

export async function cancelSale (org_id: string, id: string) {
  return await apiRequest<{ sale: Sale }>(orgRoute(org_id) + `/sales/${id}/cancel`, { method: 'POST' })
}

export type RevenueByDay = {
  date: string
  total: number
  count: number
}

export async function getRevenue (org_id: string, days: 1 | 7 | 30 = 30) {
  return await apiRequest<{ revenue: RevenueByDay[] }>(orgRoute(org_id) + '/sales/revenue', {
    query: { days }
  })
}

export type SalesSummary = {
  totalRevenue: number
  salesCount: number
  avgOrderValue: number
  activeCustomers: number
}

export async function getSalesSummary (org_id: string) {
  return await apiRequest<SalesSummary>(orgRoute(org_id) + '/sales/summary')
}

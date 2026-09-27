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


export type SalesFilter = {
  product_id?: string
  from?: string
  to?: string
}

export type SalesListSummary = {
  count: number
  quantity: number | null
  total: number
}

type SalesPage = { sales: Sale[], page: PagingMetadata, summary: SalesListSummary }

export async function getSales(org_id: string, params: QueryPageParams & SalesFilter): Promise<SalesPage>
export async function getSales(org_id: string, id: string): Promise<{ sale: Sale }>
export async function getSales (org_id: string, idOrParams: string | (QueryPageParams & SalesFilter)) {
  if (typeof idOrParams === 'string') {
    return await apiRequest<{ sale: Sale }>(orgRoute(org_id) + `/sales/${idOrParams}`)
  }
  return await apiRequest<SalesPage>(orgRoute(org_id) + '/sales', {
    query: idOrParams
  })
}

export async function postSale (org_id: string, body: SaleBody) {
  return await apiRequest<{ sale: Sale }>(orgRoute(org_id) + '/sales', {
    body,
    method: 'POST'
  })
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

export type TopProductsResult = {
  byQuantity: { id: string, name: string, quantity: number, revenue: number }[]
  byProfit: {
    items: { id: string, name: string, profit: number }[]
    others: number
    total: number
    lossCount: number
  }
}

export async function getTopProducts (org_id: string, days: 1 | 7 | 30 = 30) {
  return await apiRequest<TopProductsResult>(orgRoute(org_id) + '/sales/top-products', {
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

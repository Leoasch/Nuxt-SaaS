import type { Customer } from '~~/shared/types'
import { apiRequest, orgRoute } from '.'

export type CustomerBody = {
  id?: string
  name: string
  email: string | null
  phone: string | null
  document: string | null
}

export async function getCustomers(org_id: string): Promise<{ customers: Customer[] }>
export async function getCustomers(org_id: string, id: string): Promise<{ customer: Customer }>
export async function getCustomers (org_id: string, id?: string) {

  if (!id) {
    return await apiRequest<{ customers: Customer[] }>(orgRoute(org_id) + '/customers')
  }
  return await apiRequest<{ customer: Customer }>(orgRoute(org_id) + `/customers/${id}`)
}

export async function searchCustomers (org_id: string, query: string) {
  return await apiRequest<{ customers: Customer[] }>(orgRoute(org_id) + '/customers/search', {
    query: { q: query }
  })
}

export async function postCustomer (org_id: string, body: CustomerBody) {
  return await apiRequest<{ customer: Customer }>(orgRoute(org_id) + '/customers', {
    body,
    method: 'POST'
  })
}

export async function editCustomer (org_id: string, body: Partial<CustomerBody>) {
  const { id, ...rest } = body
  return await apiRequest<{ customer: Customer }>(orgRoute(org_id) + `/customers/${id}`, {
    body: rest,
    method: 'PUT'
  })
}

export async function deleteCustomer (org_id: string, id: string) {
  return await apiRequest<{ customer: Customer }>(orgRoute(org_id) + `/customers/${id}`, { method: 'DELETE' })
}

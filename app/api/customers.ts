import type { Customer } from '~~/shared/types'
import { apiRequest, orgRoute } from '.'

type CustomerBody = {
  name: string
  email: string | null
  phone: string | null
  document: string | null
}

export async function getCustomers(org_id: string): Promise<{ customers: Customer[] } | null>
export async function getCustomers(org_id: string, id: string): Promise<{ customer: Customer } | null>
export async function getCustomers (org_id: string, id?: string) {

  if (!id) {
    return await apiRequest<{ customers: Customer[] }>(orgRoute(org_id) + '/customers')
  }
  return await apiRequest<{ customer: Customer }>(orgRoute(org_id) + `/customers/${id}`)
}

export async function postCustomer (org_id: string, body: CustomerBody) {
  return await apiRequest<{ customer: Customer }>(orgRoute(org_id) + '/customers', {
    body,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function editCustomer (org_id: string, id: string, body: Partial<CustomerBody>) {
  return await apiRequest<{ customer: Customer }>(orgRoute(org_id) + `/customers/${id}`, {
    body,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function deleteCustomer (org_id: string, id: string) {
  return await apiRequest<{ customer: Customer }>(orgRoute(org_id) + `/customers/${id}`, { method: 'DELETE' })
}

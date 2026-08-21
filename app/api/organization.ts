import type { Organization } from '~~/shared/types'
import { apiRequest } from '.'

type OrganizationBody = {
  id?: string
  name: string
  document: string
}

export async function getOrganizations (): Promise<{ organizations: Organization[] } | null>
export async function getOrganizations (id: string): Promise<{ organization: Organization } | null>
export async function getOrganizations (id?: string) {
  if (!id) {
    return await apiRequest<{ organizations: Organization[] }>('/organizations')
  }
  return await apiRequest<{ organization: Organization }>(`/organizations/${id}`)
}

export async function postOrganization (body: OrganizationBody) {
  return await apiRequest<{ organization: Organization[] }>('/organizations', {
    body,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function editOrganization (body: OrganizationBody) {
  return await apiRequest<{ organization: Organization[] }>('/organizations', {
    body,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function deleteOrganization () {
  return await apiRequest<{ organization: Organization[] }>('/organizations', { method: 'DELETE' })
}

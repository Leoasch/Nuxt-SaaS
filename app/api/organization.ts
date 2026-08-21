import type { Organization } from '~~/shared/types'
import { apiRequest } from '.'

export type OrganizationBody = {
  id?: string
  name: string
  document: string | null
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
  return await $fetch<{ organization: Organization }>('/api/organizations', {
    method: 'POST',
    body,
  })
}

export async function editOrganization (body: OrganizationBody) {
  const { id, ...rest } = body

  return await $fetch<{ organization: Organization }>(`/api/organizations/${id}`, {
    method: 'PUT',
    body: rest,
  })
}

export async function deleteOrganization (id: string) {
  return await $fetch<{ organization: Organization }>(`/api/organizations/${id}`, { method: 'DELETE' })
}

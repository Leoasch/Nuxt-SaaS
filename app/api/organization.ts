import type { Membership, Organization } from '~~/shared/types'
import { apiRequest, orgRoute } from '.'

export type OrganizationBody = {
  id?: string
  name: string
  document: string | null
}

export type InviteMemberBody = {
  user_id: string
  role: Role
}

export async function getOrganizations(params: QueryPageParams): Promise<{ organizations: Organization[], page: PagingMetadata }>
export async function getOrganizations (id: string): Promise<{ organization: Organization }>
export async function getOrganizations (idOrParams: string | QueryPageParams) {
  if (typeof idOrParams === 'string') {
    return await apiRequest<{ organization: Organization }>(orgRoute(idOrParams))
  }
  return await apiRequest < { organizations: Organization[], page: PagingMetadata }>('/organizations', {
    query: idOrParams
  })
}

export async function searchOrganizations (query: string) {
  return await apiRequest<{ organizations: Organization[] }>('/organizations/search', {
    query: { q: query }
  })
}

export async function getOwnedOrganizations () {
  return await apiRequest<{ organizations: Organization[] }>('/organizations/owned')
}

export async function postOrganization (body: OrganizationBody) {
  return await apiRequest<{ organization: Organization }>('/organizations', {
    method: 'POST',
    body,
  })
}

export async function editOrganization (body: OrganizationBody) {
  const { id, ...rest } = body

  return await apiRequest<{ organization: Organization }>(orgRoute(id!), {
    method: 'PUT',
    body: rest,
  })
}

export async function deleteOrganization (id: string) {
  return await apiRequest<{ organization: Organization }>(orgRoute(id), { method: 'DELETE' })
}

export async function getOrganizationMembers (organization_id: string): Promise<{ memberships: Membership[] }>
export async function getOrganizationMembers (organization_id: string, member_id: string): Promise<{ membership: Membership }>
export async function getOrganizationMembers (organization_id: string, member_id?: string) {
  if (!member_id) {
    return await apiRequest<{ memberships: Membership[] }>(`/organizations/${organization_id}/members`)
  }
  return await apiRequest<{ membership: Membership }>(`/organizations/${organization_id}/members/${member_id}`)
}

export async function inviteMember (organization_id: string, body: InviteMemberBody) {
  return await apiRequest<{ membership: Membership }>(`/organizations/${organization_id}/members`, {
    method: 'POST',
    body,
  })
}

export async function alterMemberRole (organization_id: string, body: InviteMemberBody) {
  return await apiRequest<{ membership: Membership }>(orgRoute(organization_id) + `/members/${body.user_id}`, {
    method: 'PUT',
    body,
  })
}

export async function getOrganizationInvites () {
  return await apiRequest<{ invites: Membership[] }>('/organizations/invites')
}

export async function acceptOrganizationInvite (organization_id: string, accept: boolean) {
  return await apiRequest<{ membership: Membership }>(orgRoute(organization_id) + '/accept', {
    method: 'POST',
    body: { accept }
  })
}

export async function deleteMember (member: Membership) {
  return await apiRequest<{ membership: Membership }>(orgRoute(member.organization_id) + `/members/${member.user_id}`, {
    method: 'DELETE'
  })
}

export async function transferOwnership (member: Membership) {
  return await apiRequest<{ membership: Membership, previousOwnerMembership: Membership }>(
    orgRoute(member.organization_id) + `/members/${member.user_id}/transfer-ownership`,
    { method: 'POST' }
  )
}